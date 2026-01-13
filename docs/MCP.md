# “MCP tools” in this repo (and how to extend them)

This project uses the term “MCP tools” to mean **structured tool calls embedded in the LLM response**, not a separate MCP server runtime.

Tool calls look like:

- `{{TOOL:open_artifact:type=gallery}}`
- `{{TOOL:open_artifact:type=website,url=https://example.com,title=Demo}}`
- `{{TOOL:answer_about_me:topic=hobbies,question=what do you do for fun?}}`

They are:

1. **Defined + described** in `src/services/mcpTools.js`
2. **Parsed** from assistant output with `parseToolCalls`
3. **Executed** in `src/components/ChatInterface.jsx` via `executeTool`

## Add a new tool (step-by-step)

### 1) Add the tool definition

Edit `src/services/mcpTools.js`:

- Add a new entry to `TOOL_DEFINITIONS`
- Update the `getToolSystemPrompt()` text:
  - What the tool does
  - The exact syntax
  - When to use it (trigger phrases)
  - Example usage

### 2) Implement the tool execution

Edit `src/components/ChatInterface.jsx`:

- Add a `case "<tool_name>"` in `executeTool(tool, params)`

Tools can do one of two things:

- **UI action tools**: open/close an artifact (return `null`)
- **Answer tools**: return `{ role: "assistant", content: "..." }` so the chat shows an answer

### 3) Keep tool output user-friendly

If the LLM returns only tool syntax, `ChatInterface` will:

- strip tool syntax for display
- append tool-generated messages (for tools like `answer_about_me`)

## Add a new “artifact” type

Example: a new `type=contact` was added.

You need to:

1. Update tool docs (`mcpTools.js`) so the model knows it exists.
2. Ensure `ChatInterface` handles `open_artifact:type=<your_type>`.
3. Render it in `ArtifactOverlay`:
   - `case '<your_type>': return <YourView />;`

## Adding more “MCP servers” / backends (future-proofing)

If you later want to add real server-side capabilities, you have two common options:

### Option A: Cloudflare Worker (recommended for this repo)

Use Workers for things like:

- listing Cloudflare R2 buckets (gallery)
- sending email (future contact form)

Pattern:

1. Create a Worker endpoint (e.g. `/send-email`, `/images`)
2. Add an env var pointing at the Worker:
   - `VITE_*` or `CLOUDFLARE_*` (see `vite.config.js`)
3. Add a client-side service under `src/services/` that calls it
4. Add a tool that triggers the UI / calls the service

### Option B: Add a separate server (not currently used)

This repo is currently a static Vite app. If you introduce a server:

- document the runtime (Node/Express, etc.)
- add a deployment plan
- keep secrets server-side (never in client env vars)

## Conventions

- Keep tools **small** and **deterministic**.
- If a tool answers about Seymur, it should use **`me.json`** (no hallucination).
- For “show me” requests, prefer opening artifacts over long explanations.


