// src/utils/migrationUtility.ts

import { sqliteService } from "@services/storage/sqliteService";
import { mmkvService } from "@services/storage/mmkvService";

export class MigrationUtility {
  /**
   * CRITICAL: Run this ONCE to fix existing database
   */
  static async fixExistingDatabase(): Promise<void> {
    console.log("[Migration] Starting database fix...");

    try {
      // Step 1: Fix NULL/empty JSON fields in sparks table
      await sqliteService.execute(`
        UPDATE sparks 
        SET tags = '[]' 
        WHERE tags IS NULL OR tags = '' OR tags = 'null';
      `);

      await sqliteService.execute(`
        UPDATE sparks 
        SET concept_links = '[]' 
        WHERE concept_links IS NULL OR concept_links = '' OR concept_links = 'null';
      `);

      await sqliteService.execute(`
        UPDATE sparks 
        SET layers = NULL
        WHERE layers = '' OR layers = 'null';
      `);

      // Step 2: Fix concept_nodes
      await sqliteService.execute(`
        UPDATE concept_nodes 
        SET spark_ids = '[]' 
        WHERE spark_ids IS NULL OR spark_ids = '' OR spark_ids = 'null';
      `);

      // Step 3: Fix concept_links
      await sqliteService.execute(`
        UPDATE concept_links 
        SET spark_ids = '[]' 
        WHERE spark_ids IS NULL OR spark_ids = '' OR spark_ids = 'null';
      `);

      // Step 4: Fix concept_clusters
      await sqliteService.execute(`
        UPDATE concept_clusters 
        SET concepts = '[]' 
        WHERE concepts IS NULL OR concepts = '' OR concepts = 'null';
      `);

      // Step 5: Fix daily_tag_selections
      await sqliteService.execute(`
        UPDATE daily_tag_selections 
        SET tags = '[]' 
        WHERE tags IS NULL OR tags = '' OR tags = 'null';
      `);

      console.log("[Migration] Database fix completed successfully");

      // Mark migration as done
      await mmkvService.set("database_migration_v2_done", true);

      return;
    } catch (error) {
      console.error("[Migration] Failed to fix database:", error);
      throw error;
    }
  }

  /**
   * Check if migration is needed
   */
  static async needsMigration(): Promise<boolean> {
    const migrationDone = await mmkvService.get<boolean>(
      "database_migration_v2_done"
    );
    return !migrationDone;
  }

  /**
   * Complete reset - use as last resort
   */
  static async completeReset(): Promise<void> {
    console.log("[Migration] Performing complete reset...");

    await sqliteService.resetDatabase();
    await mmkvService.clear();

    console.log("[Migration] Complete reset done");
  }
}
