import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

/**
 * eslint-config-next 16 ships native flat config, so the FlatCompat bridge this
 * file used with v15 is gone. The shareable configs are imported directly.
 */
const eslintConfig = [
    {
        ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts'],
    },

    js.configs.recommended,
    ...nextCoreWebVitals,
    ...nextTypescript,

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

    // Pre-existing debt, listed file by file rather than switched off globally.
    //
    // React 19.2 added react-hooks/set-state-in-effect, and it is right: these
    // components fetch in an effect and call setState synchronously in the same
    // tick, which triggers a second render pass before paint. Fixing it means
    // restructuring how each one loads its data — that belongs with the
    // component refactor, not with a framework upgrade.
    //
    // The rule stays an error everywhere else, so no new occurrence can appear.
    // Delete entries from this list as they are fixed; delete the block when it
    // is empty.
    {
        files: [
            'src/components/charts/ContinentBarChart.tsx',
            'src/components/charts/CountryBarChart.tsx',
            'src/components/charts/CoverageChart.tsx',
            'src/components/charts/TimelineChart.tsx',
            'src/components/map/mapContainer.tsx',
            'src/components/map/statisticsPanel.tsx',
        ],
        rules: {
            'react-hooks/set-state-in-effect': 'off',
        },
    },

    // Must stay last: disables every stylistic rule that would fight Prettier.
    prettierConfig,
];

export default eslintConfig;
