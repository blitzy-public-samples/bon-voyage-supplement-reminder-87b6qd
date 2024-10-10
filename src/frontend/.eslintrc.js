// ESLint configuration file for the frontend React TypeScript project
// Version: 1.0.0
// Description: This file defines the ESLint rules for maintaining code quality and consistency in the frontend codebase.
// Requirements addressed:
// - Code Quality (Technical Requirements/Performance Optimization)
// - TypeScript Support (Technical Requirements/Programming Languages)

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // Added jest environment for testing
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Added for accessibility
    'plugin:import/errors', // Added for import checking
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier', // This should be last to override other configs
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  rules: {
    // Turn off the rule requiring React in scope (not needed in React 17+)
    'react/react-in-jsx-scope': 'off',
    // Warn instead of error for explicit any types
    '@typescript-eslint/no-explicit-any': 'warn',
    // Turn off the rule requiring explicit return types on functions
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Ensure proper usage of React Hooks
    'react-hooks/rules-of-hooks': 'error',
    // Warn about missing dependencies in useEffect and similar hooks
    'react-hooks/exhaustive-deps': 'warn',
    // Enforce consistent import order
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
    // Prevent importing devDependencies in non-dev files
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'src/setupTests.ts']
    }],
    // Ensure proper accessibility attributes are used
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to']
    }],
    // Enforce consistent naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'interface',
        'format': ['PascalCase'],
        'prefix': ['I']
      },
      {
        'selector': 'typeAlias',
        'format': ['PascalCase']
      },
      {
        'selector': 'enum',
        'format': ['PascalCase']
      }
    ],
    // Prevent unused variables
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    // Enforce consistent use of type imports
    '@typescript-eslint/consistent-type-imports': 'error',
    // Enforce the use of `import type` for type-only imports
    '@typescript-eslint/no-import-type-side-effects': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // TypeScript-specific rules
        '@typescript-eslint/explicit-function-return-type': ['error', {
          'allowExpressions': true,
          'allowTypedFunctionExpressions': true
        }],
        '@typescript-eslint/no-non-null-assertion': 'error',
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      extends: ['plugin:jest/recommended', 'plugin:testing-library/react'],
      plugins: ['jest', 'testing-library'],
      rules: {
        // Test-specific rules
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
        'testing-library/await-async-query': 'error',
        'testing-library/no-await-sync-query': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-dom-import': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
    react: {
      version: 'detect',
    },
  },
};