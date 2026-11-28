# Ultiwrite marketplace handoffs

These packages use the shared Ultiwrite service. The public source is available on GitHub. Each marketplace handles publishing through its own account and review process.

| Channel | Source and remaining provider work |
| --- | --- |
| Google Connected Apps | [Console fields and backend handoff](google/README.md). Obtain preview access and the console’s domain token and app-specific redirects, then run the Gemini and Search host review. |
| Meta Muse | [Submission copy and review scenarios](meta/README.md) alongside the [current Muse client package](../hosts/muse.md). Confirm the signed-in form and callback, then test the host. |
| Salesforce AgentExchange | [Salesforce project and setup](salesforce/README.md). Provision a real org, verify per-user OAuth and retrieve metadata for the managed package. |
| AWS Marketplace | [Buyer setup and integration handoff](aws/README.md). Choose the offer and implement its buyer, entitlement and billing flows before a buyer test. |
| Microsoft 365 Copilot | [Publisher handoff](microsoft/NEXT_STEPS.md). Use the current agent package and actual tenant app, OAuth configuration and public client IDs. |
| Cursor | [Current plugin](../cursor/README.md). Test the current package in Cursor and use the existing marketplace listing. |
| MCP Registry | [Registry ownership and validation](../registry/README.md). Prove the selected publisher namespace before publication. |

Run `node scripts/validate-distribution.mjs` for structural checks and `python3 scripts/pack-distribution.py` to build a ZIP with the channel sources and current connector artifacts. The ZIP contains `CONTENTS.json` and a SHA-256 sidecar. The [1.0.3 handoff ZIP](../release/ultiwrite-marketplace-handoffs-1.0.3.zip) is available from this repository.
