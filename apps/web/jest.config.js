const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: __dirname,
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};

module.exports = createJestConfig(customJestConfig);
