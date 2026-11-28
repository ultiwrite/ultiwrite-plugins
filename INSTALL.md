# Install and update Ultiwrite connectors

Use the package for the target host. All hosts connect to the same Ultiwrite service and existing account. Account permissions, investigation allowance and saved reports stay with that account.

## Terminal installer

Run the installer with Node.js 22 or later and Git:

```sh
npx --yes github:ultiwrite/ultiwrite-plugins#main install cursor
```

Use `claude-code`, `vscode`, or `codex` in place of `cursor`. Add `--dry-run` to review changes, then complete OAuth in your client. The [CLI guide](cli/README.md) covers Cline and Windsurf, hosted-app setup, removal and publishing. `@ultiwrite/cli` is currently distributed through GitHub source.

| Host | Source/package | Connection recovery |
| --- | --- | --- |
| ChatGPT/Codex | `chatgpt/`, `release/ultiwrite-chatgpt-plugin-0.11.0.zip` | Plugin settings > Ultiwrite > Connect/Reconnect; Connect another account where offered |
| Claude | `claude/`, `release/Ultiwrite_Claude_Plugin_v0.11.0.zip` | Plugins > Ultiwrite > Connectors > Connect; Claude Code `/mcp` > Authenticate |
| Cursor | `cursor/`, `release/ultiwrite-cursor-plugin-0.11.0.zip` | Existing Ultiwrite MCP server's authentication control |
| Grok Bot | `grokbot/` submission dossier | Host's supported MCP account controls |

ChatGPT: update the original Ultiwrite listing rather than creating a duplicate. The previously recorded original identity is `plugin_asdk_app_6ad72494738c8191af2df24a75ab4afc`; inspect current publisher state before replacing a draft. A ZIP build alone does not upload or approve the listing.

Claude Code:

```text
/plugin marketplace add dennis430/ultiwrite-plugins
/plugin install ultiwrite@ultiwrite
```

For a one-session test, use `claude --plugin-dir ./claude` from this repository. The argument is an extracted directory, not a ZIP. A connector-only setup is:

```sh
claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp
```

New remote MCP connections use `https://mcp.dwsoffshorepartners.com/mcp`. Existing connections can retain `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp` for compatibility. OAuth is required for private account data; do not paste an API key into a config or chat.

## Choose the right account

Start with “Connect Ultiwrite and confirm which account is connected.” The protected account check verifies the grant. For another identity, use the host's account selector or Connect another account when available. Otherwise reconnect this Ultiwrite connection and choose **Use a different account** on the consent screen. The account check must confirm the new identity before reading reports or submitting evidence. Do not confuse a host connection-slot label with a verified account.

## Permissions and default features

Reading requires `ultiwrite:read`; evidence submission and audited case dispositions also require `ultiwrite:evidence`. Select access in the real authorization flow. Host approval modes determine when a tool invocation needs approval and remain separate from account scopes.

The six packaged workflows permit automatic invocation by default. Claude also declares `defaultEnabled: true` for new installations. Existing user-disabled choices and workspace policies take precedence. A default-enabled workflow does not start work, record a disposition, select a paid Document Forensics add-on, grant credits or approve a charge.

## Release status

The public repository includes ChatGPT, Claude and Cursor 0.11.0 packages, Grok Bot dossier 0.9.0, and optional local adapter 0.8.0. See [the host guide](hosts/README.md) for setup and verification status by host.

Sign in through Ultiwrite’s existing account flow and approve scoped OAuth access. Connection does not grant usage. Check the returned accountStatus with `ultiwrite_capabilities_get` before a requested investigation. The first eligible complimentary investigation remains available once per account, with no card required. Existing paid entitlements, report access and canonical usage accounting remain unchanged.

## Source validation

Export to a new empty directory with `node scripts/export-plugin-distribution.mjs --out <outside-path>`. In that controlled export, run `node scripts/validate-public-plugins.mjs`, rebuild with `node scripts/pack-public-connectors.mjs`, then verify with `node scripts/pack-public-connectors.mjs --check`. Historical archives remain intact. Test installation, account labels, switching, reconnect, declined permissions and the case-disposition retry in the intended host before claiming the installed experience is verified.

The local npm wrapper is prepared at 0.8.0 and is not published by this connector release. Do not advertise `npx ultiwrite-mcp` until the real package is published and a clean registry installation succeeds.
