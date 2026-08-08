import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts'],
    },

    ...compat.extends('next/core-web-vitals', 'next/typescript'),

    {
        rules: {
            // The codebase currently has zero escape hatches from the type system.
            // These rules exist to keep it that way, not to fix an existing problem.
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],

            // console.warn and console.error are legitimate in the tile layers,
            // where a provider endpoint can fail at runtime. console.log is not.
            'no-console': ['error', { allow: ['warn', 'error'] }],
        },
    },

    // Must stay last: disables every stylistic rule that would fight Prettier.
    prettierConfig,
];

export default eslintConfig;
