import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Start currently adds a TypeScript registration footer even with disableTypes.
// Keep file-based routing and its build manifest, but honor JavaScript mode.
const target = fileURLToPath(new URL('../node_modules/@tanstack/start-plugin-core/dist/esm/start-router-plugin/route-tree-footer.js', import.meta.url))
const source = readFileSync(target, 'utf8')
const marker = '// Honor JavaScript-only route generation.'
const original = 'const { startConfig, resolvedStartConfig } = opts.getConfig();'
if (!source.includes(marker)) {
  if (!source.includes(original)) throw new Error('TanStack Start changed. Review the JavaScript route footer patch before upgrading.')
  writeFileSync(target, source.replace(original, `${original}
  ${marker}
  if (startConfig.router.disableTypes) {
    const footer = startConfig.router.routeTreeFileFooter;
    return typeof footer === 'function' ? footer() : (footer ?? []);
  }`))
}
