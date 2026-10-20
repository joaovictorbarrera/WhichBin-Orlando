import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootPomPath = fileURLToPath(new URL('../pom.xml', import.meta.url))
const rootPom = readFileSync(rootPomPath, 'utf8')
const properties = rootPom.match(/<properties\b[^>]*>([\s\S]*?)<\/properties>/)?.[1]
const revision = properties
  ?.replace(/<!--[\s\S]*?-->/g, '')
  .match(/<revision>\s*([^<\s]+)\s*<\/revision>/)?.[1]

if (!revision) {
  throw new Error(`Could not find the <revision> property in ${rootPomPath}`)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(revision),
  },
  server: {
    port: 7000,
  },
})
