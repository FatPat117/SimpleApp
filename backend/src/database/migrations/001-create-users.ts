import { DataTypes, type QueryInterface } from "sequelize";

export const migration001CreateUsers = {
  name: "001-create-users",
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailVerificationToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requiresPasswordChange: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      refreshTokenHash: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  }
};
