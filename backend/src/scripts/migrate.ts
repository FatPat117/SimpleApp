import { sequelize } from "../config/database";
import { runMigrations } from "../database/runMigrations";

const main = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    console.log("Migrations completed");
  } finally {
    await sequelize.close();
  }
};

void main().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
