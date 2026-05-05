/** Bootstrap: DB connect + run migrations/seed + listen PORT. */
import { app } from "./app";
import { sequelize } from "./config/database";
import { runMigrations } from "./database/runMigrations";
import { runSeeders } from "./database/runSeeders";
import { env } from "./config/env";
import "./models/user.model";
import { mailQueueService } from "./services/mail-queue.service";

const bootstrap = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    await runSeeders();
    await mailQueueService.startConsumer();

    app.listen(env.PORT, () => {
      console.log(`Backend server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void bootstrap();
