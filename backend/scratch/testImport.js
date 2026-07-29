try {
  const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
  console.log("SUCCESS: MCP SDK successfully required!");
  console.log("Client:", typeof Client);
  console.log("StdioClientTransport:", typeof StdioClientTransport);
} catch (err) {
  console.log("ERROR requiring MCP SDK:", err.message);
}
