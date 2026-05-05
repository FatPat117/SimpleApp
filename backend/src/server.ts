import { app } from "./app";
import { sequelize } from "./config/database";
import { env } from "./config/env";
import "./models/user.model";

const bootstrap = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(env.PORT, () => {
      console.log(`Backend server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void bootstrap();
