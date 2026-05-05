/** Một Sequelize instance → Postgres (`DATABASE_URL`). */
import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});
