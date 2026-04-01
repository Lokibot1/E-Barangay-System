/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  moduleNameMapper: {
    // Redirect Vite runtime config to a static mock (avoids import.meta issues
    // inside runtimeApi.js itself and gives tests a predictable base URL).
    "^.+/config/runtimeApi$": "<rootDir>/src/mocks/runtimeApi.js",

    // Silence static asset imports that Jest can't process
    "\\.(css|less|scss|sass|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$":
      "<rootDir>/src/mocks/fileMock.js",
  },

  testMatch: ["**/tests/**/*.test.[jt]s?(x)"],

  // Collect coverage from service files only (no need to include UI yet)
  collectCoverageFrom: [
    "src/services/sub-system-3/**/*.js",
    "src/homepage/services/loginService.js",
  ],
};
