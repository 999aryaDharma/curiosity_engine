// src/services/storage/sqliteService.ts

import * as SQLite from "expo-sqlite";

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = "curiosity_engine.db";
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[SQLite] Already initialized");
      return;
    }

    try {
      console.log("[SQLite] Opening database...");
      this.db = await SQLite.openDatabaseAsync(this.dbName);

      await this.runMigrations();
      this.isInitialized = true;
      console.log("[SQLite] Database initialized successfully");
    } catch (error) {
      console.error("[SQLite] Initialization failed:", error);
      throw new Error("Failed to initialize database");
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error("Database not opened");

    const statements = [
      // Tags Table
      `CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        cluster TEXT,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER,
        is_default INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_tags_cluster ON tags(cluster)`,
      `CREATE INDEX IF NOT EXISTS idx_tags_last_used ON tags(last_used)`,

      // Daily Tag Selections
      `CREATE TABLE IF NOT EXISTS daily_tag_selections (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        tags TEXT NOT NULL,
        is_manually_edited INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_daily_tags_date ON daily_tag_selections(date)`,

      // Sparks Table
      `CREATE TABLE IF NOT EXISTS sparks (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        tags TEXT NOT NULL,
        mode INTEGER NOT NULL,
        layers TEXT,
        concept_links TEXT,
        follow_up TEXT,
        created_at INTEGER NOT NULL,
        viewed INTEGER DEFAULT 0,
        saved INTEGER DEFAULT 0
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sparks_mode ON sparks(mode)`,
      `CREATE INDEX IF NOT EXISTS idx_sparks_created_at ON sparks(created_at DESC)`,

      // Concept Nodes
      `CREATE TABLE IF NOT EXISTS concept_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        cluster TEXT NOT NULL,
        weight REAL DEFAULT 0.5,
        spark_ids TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_concepts_cluster ON concept_nodes(cluster)`,

      // Concept Links
      `CREATE TABLE IF NOT EXISTS concept_links (
        id TEXT PRIMARY KEY,
        concept_a TEXT NOT NULL,
        concept_b TEXT NOT NULL,
        strength REAL NOT NULL,
        link_type TEXT,
        last_update INTEGER NOT NULL,
        spark_ids TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_links_concept_a ON concept_links(concept_a)`,
      `CREATE INDEX IF NOT EXISTS idx_links_concept_b ON concept_links(concept_b)`,

      // Concept Clusters
      `CREATE TABLE IF NOT EXISTS concept_clusters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        concepts TEXT NOT NULL,
        coherence REAL DEFAULT 0.5,
        spark_count INTEGER DEFAULT 0,
        last_updated INTEGER NOT NULL
      )`,

      // Tag History
      `CREATE TABLE IF NOT EXISTS tag_history (
        id TEXT PRIMARY KEY,
        tag_id TEXT NOT NULL,
        used_at INTEGER NOT NULL,
        strategy TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_tag_history_tag_id ON tag_history(tag_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tag_history_used_at ON tag_history(used_at DESC)`,

      // Settings
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Metadata
      `CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    ];

    try {
      for (const statement of statements) {
        await this.db.execAsync(statement);
      }
      console.log("[SQLite] Migrations completed");
    } catch (error) {
      console.error("[SQLite] Migration failed:", error);
      throw error;
    }
  }

  async execute(
    sql: string,
    params: any[] = []
  ): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    try {
      return await this.db.runAsync(sql, params);
    } catch (error) {
      console.error("[SQLite] Query failed:", error);
      throw error;
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    try {
      const result = await this.db.getAllAsync<T>(sql, params);
      return result;
    } catch (error) {
      console.error("[SQLite] Query failed:", error);
      throw error;
    }
  }

  async insert(table: string, data: Record<string, any>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const result = await this.execute(sql, values);

    return result.lastInsertRowId;
  }

  async update(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: any[] = []
  ): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const result = await this.execute(sql, [...values, ...whereParams]);

    return result.changes;
  }

  async delete(
    table: string,
    where: string,
    whereParams: any[] = []
  ): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.execute(sql, whereParams);

    return result.changes;
  }

  async dropAllTables(): Promise<void> {
    const tables = [
      "tags",
      "daily_tag_selections",
      "sparks",
      "concept_nodes",
      "concept_links",
      "concept_clusters",
      "tag_history",
      "settings",
      "metadata",
    ];

    for (const table of tables) {
      await this.execute(`DROP TABLE IF EXISTS ${table}`);
    }

    console.log("[SQLite] All tables dropped");
  }

  async resetDatabase(): Promise<void> {
    await this.dropAllTables();
    await this.runMigrations();
    console.log("[SQLite] Database reset complete");
  }

  async getMetadata(key: string): Promise<string | null> {
    const results = await this.query<{ value: string }>(
      "SELECT value FROM metadata WHERE key = ?",
      [key]
    );

    return results.length > 0 ? results[0].value : null;
  }

  async setMetadata(key: string, value: string): Promise<void> {
    const now = Date.now();
    const existing = await this.getMetadata(key);

    if (existing) {
      await this.update("metadata", { value, updated_at: now }, "key = ?", [
        key,
      ]);
    } else {
      await this.insert("metadata", {
        key,
        value,
        updated_at: now,
      });
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log("[SQLite] Database closed");
    }
  }
}

export default new SQLiteService();
