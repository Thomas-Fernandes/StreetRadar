/**
 * vitest.config.ts
 *
 * There was no vitest config at all. That worked only for as long as no tested
 * file imported through the `@/` alias — the moment one did, the suite failed to
 * resolve it and reported "0 test", which reads like a passing run at a glance.
 *
 * The alias mirrors `paths` in tsconfig.json. Keep the two in step.
 */

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
