/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testMatch: ['<rootDir>/src/tests/*.test.ts'],
  testEnvironment: 'node',
};
