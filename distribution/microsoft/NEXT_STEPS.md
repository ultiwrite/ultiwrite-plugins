# Microsoft 365 Copilot publisher handoff

Use the existing DWS Offshore Fund publisher registration. The [current Microsoft project](../../microsoft365/README.md) builds the declarative agent, verifies the package against Microsoft’s schemas and provisions the Teams app and its OAuth registration with Microsoft 365 Agents Toolkit. The released source ZIP is linked from the [distribution guide](../../DISTRIBUTION.md).

1. In the intended tenant, [create or reuse the Ultiwrite app](https://dev.teams.microsoft.com/apps). Confirm the test account has Copilot access and permission to upload custom apps.
2. Use the current project’s `register-client` command once for the exact callback `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect`. Keep the Teams app ID, Microsoft OAuth configuration ID and Ultiwrite public client ID separate.
3. Configure static public-client OAuth with S256 PKCE for **Any Teams app**. Choose **Any Microsoft 365 organization** for the public offer. Use the project's documented setup, provision and package commands. The configured ZIP requires the three actual identifiers.
4. Sideload the configured ZIP and complete the [reviewer scenarios](../../microsoft365/docs/reviewer-scenarios.md) in Microsoft 365 Copilot. Record the package checksum and collect screenshots and reviewer setup instructions from that run.
5. Use the existing [Partner Center account](https://partner.microsoft.com/dashboard) and select a Microsoft 365 and Copilot offer that accepts declarative agents with MCP actions. The [release guide](../../microsoft365/docs/release.md) includes the materials for the review submission.
