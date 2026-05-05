import { sequelize } from "../config/database";
import { runSeeders } from "../database/runSeeders";
import "../models/user.model";

const main = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await runSeeders();
    console.log("Seeders completed");
  } finally {
    await sequelize.close();
  }
};

void main().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
