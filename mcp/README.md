# Glassbox MCP endpoint

An HTTP Model Context Protocol server for discovering the existing Glassbox offer and the separate Nest synthetic dataset. Its three read-only tools are `glassbox_offer`, `glassbox_checkout` and `nest_dataset_offer`.

The Glassbox access price is A$1 for one unique attempt. The A$10 completion bounty is conditional on machine verification. Payment is through Stripe hosted checkout, with the GitHub username entered at checkout. Machine-native MPP and x402 settlement are not active. Connecting to this MCP server or calling its tools never charges an agent.

Run with Node 20 or later: `npm install && npm start`. The HTTP endpoint is `/mcp`, and `/health` is a simple availability check. Set `PORT` as needed. On Render, the service uses `RENDER_EXTERNAL_HOSTNAME` for host validation.

The endpoint makes the offers callable from an MCP client. An agent host must explicitly connect to it and provide any spending authority. Publishing an MCP listing does not send traffic or create purchases by itself.
