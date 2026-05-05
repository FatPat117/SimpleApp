import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database";
import { migrations } from "./migrations";

const MIGRATION_TABLE = "schema_migrations";

const ensureMigrationTable = async (): Promise<void> => {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "${MIGRATION_TABLE}" (
      "name" VARCHAR(255) PRIMARY KEY,
      "executedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  );
};

const getExecutedMigrationNames = async (): Promise<Set<string>> => {
  const rows = await sequelize.query<{ name: string }>(
    `SELECT "name" FROM "${MIGRATION_TABLE}" ORDER BY "executedAt" ASC;`,
    { type: QueryTypes.SELECT }
  );

  return new Set(rows.map((row) => row.name));
};

// Applies pending migrations once at startup.
export const runMigrations = async (): Promise<void> => {
  await ensureMigrationTable();
  const executedMigrations = await getExecutedMigrationNames();
  const queryInterface = sequelize.getQueryInterface();

  for (const migration of migrations) {
    if (executedMigrations.has(migration.name)) {
      continue;
    }

    await migration.up(queryInterface);
    await sequelize.query(`INSERT INTO "${MIGRATION_TABLE}" ("name") VALUES (:name);`, {
      replacements: { name: migration.name }
    });
  }
};
