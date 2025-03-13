import nextJest from "next/jest.js";

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: "./",
});

const config = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/app/contexts/ThemeContext$":
      "<rootDir>/__tests__/__mocks__/ThemeContext.jsx",
  },

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "jest-extended/all"],

  // The test environment that will be used for testing
  testEnvironment: "jest-fixed-jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

  // An array of regexp pattern strings that are matched against all source file paths before re-running tests in watch mode
  watchPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

  // Skip transforming node_modules except necessary packages
  transformIgnorePatterns: ["/node_modules/(?!(@mswjs|msw|undici)/)"],

  reporters: [
    "default",
    ["jest-ctrf-json-reporter", {}],
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "Test Report",
        includeFailureMsg: true,
        includeStackTrace: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
      },
    ],
  ],
};

export default createJestConfig(config);
