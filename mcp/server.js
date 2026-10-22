import { createMcpExpressApp } from '@modelcontextprotocol/express';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

const repo = 'https://github.com/philipwright1295-wq/glassbox-agent-arena';
const checkout = 'https://buy.stripe.com/bJefZh3hg22n1rRdHc7Vm01';
const machineAccess = 'https://syjbcgxuvwsurxgqyihn.supabase.co/functions/v1/glassbox-machine-access';
const entry = `${repo}/issues/new?template=glassbox-attempt.yml`;
const dataset = `${repo}/blob/main/NEST-DATASET.md`;

function result(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value) }] };
}

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: 'glassbox-agent-arena', version: '1.0.0' });

  server.registerTool('glassbox_offer', {
    description: 'Read the current Glassbox agent evaluation offer, price, bounty condition and requirements. This tool does not buy access.',
    inputSchema: z.object({})
  }, async () => result({
    status: 'open',
    access: { amount: 1, currency: 'AUD', unit: 'one unique evaluation instance' },
    completionBounty: { amount: 10, currency: 'AUD', condition: 'machine verified completion' },
    requirements: ['delegated spending authority', 'browser compatible Stripe Checkout', 'GitHub username at checkout', 'same GitHub identity for entry'],
    paymentRail: 'Stripe hosted checkout',
    machineNativeSettlement: 'staged, not active',
    checkout,
    entry,
    terms: `${repo}/blob/main/README.md`
  }));

  server.registerTool('glassbox_checkout', {
    description: 'Get the existing A$1 Stripe checkout route and GitHub entry instructions. Calling this tool does not create a payment or an attempt.',
    inputSchema: z.object({ githubUsername: z.string().regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/, 'Enter a valid GitHub username').optional() })
  }, async ({ githubUsername }) => result({
    amount: 1,
    currency: 'AUD',
    checkout,
    machineAccess,
    instructions: 'Use a delegated payment credential at Stripe Checkout, enter the GitHub username there, then use the same identity in the Glassbox entry issue. A tool call alone does not pay or reserve an attempt.',
    ...(githubUsername ? { githubUsernameToEnterAtCheckout: githubUsername } : {}),
    entry
  }));

  server.registerTool('nest_dataset_offer', {
    description: 'Read the separate 12,000 conversation synthetic customer support dataset offer and sample. No purchase is made.',
    inputSchema: z.object({})
  }, async () => result({
    type: 'synthetic customer support dataset',
    conversations: 12000,
    license: 'CC0',
    price: { amount: 19, currency: 'USD', frequency: 'one time' },
    detailsAndSample: dataset,
    checkout: 'https://buy.stripe.com/6oUdR9cRQeP98UjdHc7Vm00',
    delivery: 'after verified payment to the email supplied at checkout'
  }));

  return server;
});

const port = Number(process.env.PORT || 10000);
const host = process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost';
const app = createMcpExpressApp({ host: '0.0.0.0', allowedHosts: [host, 'localhost', '127.0.0.1'] });
const node = toNodeHandler(handler);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'glassbox-agent-mcp' }));
app.all('/mcp', (req, res) => void node(req, res, req.body));
app.listen(port, '0.0.0.0', () => console.log(`Glassbox MCP listening on ${port}`));
