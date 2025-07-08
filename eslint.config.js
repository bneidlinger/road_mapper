import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);

function requireFromEslint(moduleName) {
  try {
    return require(moduleName);
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(globalRoot + '/eslint/node_modules/' + moduleName);
  }
}

const js = requireFromEslint('@eslint/js');
const globals = requireFromEslint('globals');

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];
