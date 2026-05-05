/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};
