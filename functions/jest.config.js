// Jest configuration for the Cloud Functions package
// - Transpiles TypeScript via ts-jest
// - Treats .ts test files under src/
// - Maps ESM-style .js imports in TS to their .ts sources for tests

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // Compile tests to CommonJS to avoid Node ESM quirks in Jest
        tsconfig: {
          // Inherit most settings from tsconfig.json but force CommonJS for Jest transpilation
          module: 'CommonJS',
          moduleResolution: 'node',
          esModuleInterop: true,
          target: 'es2017',
          skipLibCheck: true,
          sourceMap: true,
          strict: true,
        },
        diagnostics: true,
      },
    ],
  },
  moduleNameMapper: {
    // Allow "import './x.js'" in TS to resolve the TS sources
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

module.exports = config;
