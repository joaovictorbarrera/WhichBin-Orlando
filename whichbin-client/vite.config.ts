/// <reference types="vitest" />
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const versionScriptPath = fileURLToPath(
  new URL('../scripts/generate-version.mjs', import.meta.url),
)
const rootPomPath = fileURLToPath(new URL('../pom.xml', import.meta.url))

function getPomRevision() {
  const rootPom = readFileSync(rootPomPath, 'utf8')
  const properties = rootPom.match(/<properties\b[^>]*>([\s\S]*?)<\/properties>/)?.[1]
  const revision = properties
    ?.replace(/<!--[\s\S]*?-->/g, '')
    .match(/<revision>\s*([^<\s]+)\s*<\/revision>/)?.[1]

  if (!revision) {
    throw new Error(`Could not find the <revision> property in ${rootPomPath}`)
  }

  return revision
}

export default defineConfig(({ command }) => {
  const revision = command === 'build'
    ? execFileSync(process.execPath, [versionScriptPath], {
        encoding: 'utf8',
      }).trim()
    : getPomRevision()

  // https://vite.dev/config/
  return {
    plugins: [
      {
        name: 'app-version',
        enforce: 'pre',
        transform(code) {
          return code.includes('__APP_VERSION__')
            ? code.replaceAll('__APP_VERSION__', JSON.stringify(revision))
            : null
        },
      },
      react(),
    ],
    server: {
      port: 7000,
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  }
})
