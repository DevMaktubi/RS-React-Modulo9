module.exports = {
  testIgnorePatterns: ['/node_modules/','/.next/'],
  setFilesAfterEnv: [
    "<rootDir>/src/tests/setupTests.ts",
  ] ,
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  },
  testEnvironment: "jsdom",
};