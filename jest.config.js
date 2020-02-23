module.exports = {
  verbose: true,
  modulePaths: ["<rootDir>"],
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["./jest.setup.js"]
};
