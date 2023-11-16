module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // Handles asset imports during testing
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "identity-obj-proxy",
  },
  transform: {
    // Transforms with Babel before testing
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};
