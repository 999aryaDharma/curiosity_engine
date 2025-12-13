// src/services/storage/sqliteService.ts

import * as SQLite from "expo-sqlite";

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = "curiosity_engine.db";
  private isInitialized = false;
  private operationQueue: Promise<void> = Promise.resolve();

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

    try {
      await this.db.runAsync("BEGIN TRANSACTION;");

      // Create all base tables first
      await this.createBaseTables();

      // Check and add missing columns (for existing databases)
      await this.addMissingColumnsIfNeeded();

      // Commit transaction
      await this.db.runAsync("COMMIT;");
      console.log("[SQLite] Migrations completed");
    } catch (error) {
      await this.db.runAsync("ROLLBACK;");
      console.error("[SQLite] Migration failed:", error);
      throw error;
    }
  }

  private async createBaseTables(): Promise<void> {
    if (!this.db) return;

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

      // Sparks Table with ALL fields
      `CREATE TABLE IF NOT EXISTS sparks (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        mode INTEGER NOT NULL,
        layers TEXT,
        concept_links TEXT DEFAULT '[]',
        follow_up TEXT,
        created_at INTEGER NOT NULL,
        viewed INTEGER DEFAULT 0,
        saved INTEGER DEFAULT 0,
        knowledge TEXT,
        fun_fact TEXT,
        application TEXT,
        difficulty REAL DEFAULT 0.5,
        knowledge_revealed INTEGER DEFAULT 0
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
        spark_ids TEXT NOT NULL DEFAULT '[]',
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
        spark_ids TEXT NOT NULL DEFAULT '[]'
      )`,
      `CREATE INDEX IF NOT EXISTS idx_links_concept_a ON concept_links(concept_a)`,
      `CREATE INDEX IF NOT EXISTS idx_links_concept_b ON concept_links(concept_b)`,

      // Concept Clusters
      `CREATE TABLE IF NOT EXISTS concept_clusters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        concepts TEXT NOT NULL DEFAULT '[]',
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

      // Deep Dive Sessions
      `CREATE TABLE IF NOT EXISTS deepdive_sessions (
        id TEXT PRIMARY KEY,
        seed_spark_id TEXT NOT NULL,
        seed_spark_text TEXT NOT NULL,
        layers TEXT NOT NULL DEFAULT '[]',
        synthesis TEXT,
        current_layer INTEGER DEFAULT 0,
        max_layers INTEGER DEFAULT 4,
        is_complete INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
      )`,
    ];

    for (const statement of statements) {
      await this.db!.execAsync(statement);
    }
  }

  private async addMissingColumnsIfNeeded(): Promise<void> {
    if (!this.db) return;

    try {
      // Check current columns in sparks table
      const tableInfo = await this.db.getAllAsync<any>(
        "PRAGMA table_info(sparks);"
      );

      // DEFENSIVE FIX: Ensure tableInfo is an array before mapping
      const safeTableInfo = Array.isArray(tableInfo) ? tableInfo : [];
      const columnNames = safeTableInfo.map((col) => col.name);

      // Define new columns with their default values
      const newColumns = [
        { name: "knowledge", type: "TEXT", default: null },
        { name: "fun_fact", type: "TEXT", default: null },
        { name: "application", type: "TEXT", default: null },
        { name: "difficulty", type: "REAL", default: 0.5 },
        { name: "knowledge_revealed", type: "INTEGER", default: 0 },
        { name: "tags", type: "TEXT", default: "'[]'" },
        { name: "concept_links", type: "TEXT", default: "'[]'" },
      ];

      // Add missing columns
      for (const col of newColumns) {
        if (!columnNames.includes(col.name)) {
          console.log(`[SQLite] Adding missing column: ${col.name}`);
          const defaultValue =
            col.default === null ? "" : `DEFAULT ${col.default}`;
          await this.db.execAsync(
            `ALTER TABLE sparks ADD COLUMN ${col.name} ${col.type} ${defaultValue};`
          );
        }
      }

      // FIX: Ensure existing rows have proper JSON defaults
      await this.db.execAsync(`
        UPDATE sparks 
        SET tags = '[]' 
        WHERE tags IS NULL OR tags = '';
      `);

      await this.db.execAsync(`
        UPDATE sparks 
        SET concept_links = '[]' 
        WHERE concept_links IS NULL OR concept_links = '';
      `);

      console.log("[SQLite] Migration completed successfully");
    } catch (error) {
      console.error("[SQLite] Failed to add missing columns:", error);
      throw error;
    }
  }

  // Rest of the methods remain the same...
  async execute(
    sql: string,
    params: any[] = []
  ): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error("Database not initialized");

    const operationPromise = this.operationQueue
      .catch(() => {})
      .then(async () => {
        return await this.db!.runAsync(sql, params);
      });

    this.operationQueue = operationPromise.then(() => {}).catch(() => {});
    return operationPromise;
  }

  // UPDATE METHOD QUERY INI
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      console.warn("[SQLite] Query attempted before initialization");
      return []; // Return empty array instead of throwing if possible, or keep throw
    }

    const operationPromise = this.operationQueue
      .catch(() => {})
      .then(async () => {
        try {
          const result = await this.db!.getAllAsync<T>(sql, params);
          // GARANSI: Selalu kembalikan array
          return Array.isArray(result) ? result : [];
        } catch (error) {
          console.error(`[SQLite] Query failed: ${sql}`, error);
          return []; // Kembalikan array kosong jika query error
        }
      });

    this.operationQueue = operationPromise.then(() => {}).catch(() => {});

    // GARANSI LAPIS KEDUA: Jika operationPromise entah bagaimana undefined
    const finalResult = await operationPromise;
    return Array.isArray(finalResult) ? finalResult : [];
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

  async resetDatabase(): Promise<void> {
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
      "deepdive_sessions",
    ];

    for (const table of tables) {
      await this.execute(`DROP TABLE IF EXISTS ${table}`);
    }

    await this.runMigrations();
    console.log("[SQLite] Database reset complete");
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

export const sqliteService = new SQLiteService();
