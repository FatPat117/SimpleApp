import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database";
import { seeders } from "./seeders";

const SEED_TABLE = "schema_seeds";

const ensureSeedTable = async (): Promise<void> => {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "${SEED_TABLE}" (
      "name" VARCHAR(255) PRIMARY KEY,
      "executedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  );
};

const getExecutedSeedNames = async (): Promise<Set<string>> => {
  const rows = await sequelize.query<{ name: string }>(`SELECT "name" FROM "${SEED_TABLE}";`, {
    type: QueryTypes.SELECT
  });
  return new Set(rows.map((row) => row.name));
};

// Runs one-time seed data and tracks applied seed files.
export const runSeeders = async (): Promise<void> => {
  await ensureSeedTable();
  const executedSeeds = await getExecutedSeedNames();

  for (const seeder of seeders) {
    if (executedSeeds.has(seeder.name)) {
      continue;
    }

    await seeder.run();
    await sequelize.query(`INSERT INTO "${SEED_TABLE}" ("name") VALUES (:name);`, {
      replacements: { name: seeder.name }
    });
  }
};
