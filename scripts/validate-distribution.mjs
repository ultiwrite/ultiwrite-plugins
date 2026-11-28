#!/usr/bin/env node
// Read-only structural checks for the seven-channel submission source.
import assert from 'node:assert/strict'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const distribution = join(root, 'distribution')
const load = path => JSON.parse(readFileSync(join(root, path), 'utf8'))
const profile = load('distribution/shared/profile.json')
assert.equal(profile.legalEntity, 'DWS Offshore Fund', 'exact legal entity without DBA or suffix')
assert.equal(profile.dba, 'Ultiwrite')
assert.equal(profile.product, profile.dba)
for (const file of ['google/console-fields.json', 'meta/connection-profile.json', 'salesforce/connection-profile.json', 'aws/listing.draft.json']) {
  assert.equal(load(`distribution/${file}`).publisher, profile.legalEntity, `${file}: legal publisher`)
}
assert.equal(load('microsoft365/appPackage/manifest.json').developer.name, profile.legalEntity)
const channels = ['registry', 'cursor', 'google', 'meta', 'microsoft', 'salesforce', 'aws']
assert.deepEqual([...profile.scope].sort(), [...channels].sort(), 'exactly the seven requested channels')
assert.deepEqual(profile.excludedChannels, ['claude', 'grok', 'chatgpt'])
assert.equal(profile.submissionStatus, 'NOT_SUBMITTED')
assert.equal(profile.hostJourneyStatus, 'NOT_RUN')
assert.equal(profile.mcp.url, 'https://mcp.dwsoffshorepartners.com/mcp')
assert.equal(profile.mcp.tokenEndpointAuthMethod, 'none')
const directories = ['aws', 'google', 'meta', 'microsoft', 'salesforce', 'shared']
for (const directory of directories) assert.ok(existsSync(join(distribution, directory)), `${directory} distribution source`)
let count = 0
function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    if (['.venv', '__pycache__', 'build', 'dist', 'node_modules'].includes(name)) continue
    const path = join(dir, name)
    const stat = lstatSync(path)
    assert.ok(!stat.isSymbolicLink(), `${path}: no symlinks`)
    if (stat.isDirectory()) { walk(path); continue }
    assert.ok(stat.isFile(), 'regular source files only')
    assert.ok(!/\.(pem|key|p12|env)$/i.test(name), `${path}: no private key files`)
    assert.ok(!name.startsWith('.env'), `${path}: no environment files`)
    if (name.endsWith('.json')) JSON.parse(readFileSync(path, 'utf8'))
    if (name.endsWith('.md')) {
      const text = readFileSync(path, 'utf8')
      for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
        const link = match[1]
        if (/^[a-z][a-z\d+.-]*:|^#|^\$|^</i.test(link)) continue
        const target = resolve(dirname(path), decodeURIComponent(link.split('#')[0]))
        assert.ok(existsSync(target), `${relative(root, path)} has a missing local link: ${link}`)
      }
    }
    count++
  }
}
for (const directory of directories) walk(join(distribution, directory))
for (const [file, name] of [['registry/server.json', 'com.dwsoffshorepartners/ultiwrite'], ['server.json', 'io.github.dennis430/ultiwrite']]) {
  const server = load(file)
  assert.equal(server.name, name)
  assert.equal(server.$schema, 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json')
  assert.ok(server.description.length > 0 && server.description.length <= 100, 'registry description limit')
  assert.match(server.version, /^\d+\.\d+\.\d+$/)
  const url = file.startsWith('registry/') ? profile.mcp.compatibilityUrl : profile.mcp.url
  assert.deepEqual(server.remotes, [{ type: 'streamable-http', url }])
  assert.ok(!server.packages, 'remote-only manifest has no npm publishing dependency')
}
const cursor = load('cursor/.cursor-plugin/plugin.json')
assert.equal(cursor.version, profile.publicConnectorBaseline)
assert.ok(existsSync(join(root, `release/ultiwrite-cursor-plugin-${cursor.version}.zip`)))
const microsoft = load('microsoft365/appPackage/ai-plugin.json')
assert.equal(microsoft.runtimes[0].type, 'RemoteMCPServer')
assert.equal(microsoft.runtimes[0].auth.type, 'OAuthPluginVault')
assert.equal(microsoft.runtimes[0].spec.url, profile.mcp.compatibilityUrl)
console.log(`Seven-channel source validated (${count} files). Account provisioning, authenticated host journeys and marketplace approval are not asserted.`)
