-- src/services/storage/schema.sql
-- Database schema for Curiosity Engine
-- SQLite version 3.x

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  cluster TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used INTEGER,
  is_default INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  CONSTRAINT check_usage_count CHECK (usage_count >= 0)
);

CREATE INDEX idx_tags_cluster ON tags(cluster);
CREATE INDEX idx_tags_last_used ON tags(last_used);
CREATE INDEX idx_tags_is_default ON tags(is_default);

-- ============================================
-- DAILY TAG SELECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS daily_tag_selections (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  tags TEXT NOT NULL, -- JSON array of tag IDs
  is_manually_edited INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_daily_tags_date ON daily_tag_selections(date);

-- ============================================
-- SPARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sparks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array of tag IDs
  mode INTEGER NOT NULL,
  layers TEXT, -- JSON array of layers (for deep dive)
  concept_links TEXT, -- JSON array of concept IDs
  follow_up TEXT,
  created_at INTEGER NOT NULL,
  viewed INTEGER DEFAULT 0,
  saved INTEGER DEFAULT 0,
  CONSTRAINT check_mode CHECK (mode IN (1, 2, 3))
);

CREATE INDEX idx_sparks_mode ON sparks(mode);
CREATE INDEX idx_sparks_created_at ON sparks(created_at DESC);
CREATE INDEX idx_sparks_saved ON sparks(saved);
CREATE INDEX idx_sparks_viewed ON sparks(viewed);

-- ============================================
-- CONCEPT NODES
-- ============================================
CREATE TABLE IF NOT EXISTS concept_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cluster TEXT NOT NULL,
  weight REAL DEFAULT 0.5,
  spark_ids TEXT NOT NULL, -- JSON array
  created_at INTEGER NOT NULL,
  last_updated INTEGER NOT NULL,
  CONSTRAINT check_weight CHECK (weight >= 0 AND weight <= 1)
);

CREATE INDEX idx_concepts_cluster ON concept_nodes(cluster);
CREATE INDEX idx_concepts_weight ON concept_nodes(weight DESC);
CREATE INDEX idx_concepts_last_updated ON concept_nodes(last_updated DESC);

-- ============================================
-- CONCEPT LINKS (RELATIONSHIPS)
-- ============================================
CREATE TABLE IF NOT EXISTS concept_links (
  id TEXT PRIMARY KEY,
  concept_a TEXT NOT NULL,
  concept_b TEXT NOT NULL,
  strength REAL NOT NULL,
  link_type TEXT,
  last_update INTEGER NOT NULL,
  spark_ids TEXT NOT NULL, -- JSON array
  FOREIGN KEY (concept_a) REFERENCES concept_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (concept_b) REFERENCES concept_nodes(id) ON DELETE CASCADE,
  CONSTRAINT check_strength CHECK (strength >= 0 AND strength <= 1),
  CONSTRAINT check_link_type CHECK (link_type IN ('semantic', 'temporal', 'causal', 'associative', NULL)),
  CONSTRAINT unique_link UNIQUE (concept_a, concept_b)
);

CREATE INDEX idx_links_concept_a ON concept_links(concept_a);
CREATE INDEX idx_links_concept_b ON concept_links(concept_b);
CREATE INDEX idx_links_strength ON concept_links(strength DESC);

-- ============================================
-- CONCEPT CLUSTERS
-- ============================================
CREATE TABLE IF NOT EXISTS concept_clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  concepts TEXT NOT NULL, -- JSON array of concept IDs
  coherence REAL DEFAULT 0.5,
  spark_count INTEGER DEFAULT 0,
  last_updated INTEGER NOT NULL,
  CONSTRAINT check_coherence CHECK (coherence >= 0 AND coherence <= 1),
  CONSTRAINT check_spark_count CHECK (spark_count >= 0)
);

CREATE INDEX idx_clusters_coherence ON concept_clusters(coherence DESC);
CREATE INDEX idx_clusters_spark_count ON concept_clusters(spark_count DESC);
CREATE INDEX idx_clusters_last_updated ON concept_clusters(last_updated DESC);

-- ============================================
-- TAG HISTORY (for adaptive randomization)
-- ============================================
CREATE TABLE IF NOT EXISTS tag_history (
  id TEXT PRIMARY KEY,
  tag_id TEXT NOT NULL,
  used_at INTEGER NOT NULL,
  strategy TEXT NOT NULL,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  CONSTRAINT check_strategy CHECK (strategy IN ('history', 'wildcard', 'deep-dive', 'random'))
);

CREATE INDEX idx_tag_history_tag_id ON tag_history(tag_id);
CREATE INDEX idx_tag_history_used_at ON tag_history(used_at DESC);
CREATE INDEX idx_tag_history_strategy ON tag_history(strategy);

-- ============================================
-- SETTINGS (Key-Value Store)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'json'
  updated_at INTEGER NOT NULL,
  CONSTRAINT check_type CHECK (type IN ('string', 'number', 'boolean', 'json'))
);

CREATE INDEX idx_settings_type ON settings(type);

-- ============================================
-- METADATA (for database version tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Insert initial metadata
INSERT OR IGNORE INTO metadata (key, value, updated_at)
VALUES ('schema_version', '1.0.0', strftime('%s', 'now') * 1000);

INSERT OR IGNORE INTO metadata (key, value, updated_at)
VALUES ('last_migration', 'initial', strftime('%s', 'now') * 1000);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Recent Sparks with Tag Names
CREATE VIEW IF NOT EXISTS view_recent_sparks AS
SELECT 
  s.id,
  s.text,
  s.mode,
  s.created_at,
  s.viewed,
  s.saved,
  GROUP_CONCAT(t.name, ', ') as tag_names
FROM sparks s
LEFT JOIN tags t ON json_extract(s.tags, '$') LIKE '%' || t.id || '%'
GROUP BY s.id
ORDER BY s.created_at DESC;

-- View: Tag Statistics
CREATE VIEW IF NOT EXISTS view_tag_stats AS
SELECT 
  t.id,
  t.name,
  t.cluster,
  t.usage_count,
  t.last_used,
  COUNT(DISTINCT th.id) as history_count,
  MAX(th.used_at) as last_history_use
FROM tags t
LEFT JOIN tag_history th ON t.id = th.tag_id
GROUP BY t.id;

-- View: Cluster Statistics
CREATE VIEW IF NOT EXISTS view_cluster_stats AS
SELECT 
  cc.id,
  cc.name,
  cc.coherence,
  cc.spark_count,
  COUNT(DISTINCT cn.id) as concept_count,
  AVG(cn.weight) as avg_concept_weight,
  cc.last_updated
FROM concept_clusters cc
LEFT JOIN concept_nodes cn ON cn.cluster = cc.id
GROUP BY cc.id;