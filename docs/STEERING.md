# Steering (for humans + future LLMs)

This repo is a portfolio app. The goal is to ship a **high-polish, minimal, space-themed UX** with a chat-first interface and rich “artifact” previews.

## Product rules

- **Default to minimal UI**: avoid loud colors, heavy gradients, or playful emojis unless explicitly asked.
- **Consistency**: glass/blur, soft borders, subtle motion. Prefer “quiet” hover states.
- **Artifacts are the showcase**: when users ask to *see* something (gallery, demo, UI library), open an artifact instead of describing it.
- **Don’t invent facts**: answers about Seymur should come from `me.json` via the `answer_about_me` tool.

## Code style

- Prefer small components and single-purpose CSS modules per component.
- Keep “content data” out of components:
  - Profile: `me.json`
  - Writing links: `src/data/writings.json`
- Avoid adding new dependencies unless necessary.

## UI patterns to reuse

- **Glass**: rgba(10,10,10,0.65) + blur + subtle white border.
- **Icons**: monochrome SVG masks (no emoji icons).

## Where things live

- **Chat + tool execution**: `src/components/ChatInterface.jsx`
- **Tool definitions/prompting**: `src/services/mcpTools.js`
- **Artifact drawer**: `src/components/ArtifactOverlay.jsx`
- **Website artifact**: `src/components/WebsiteView.jsx`
- **Contact artifact**: `src/components/ContactView.jsx`
- **Gallery artifact**: `src/components/GalleryView.jsx`
- **Top-right actions**: `src/components/TopRightActions.jsx`
- **Sidebar writing rail**: `src/components/Sidebar.jsx`

## Adding a new “showcase”

If you add a new showcase (e.g. another website demo):

- Implement the UI component (or reuse `WebsiteView`)
- Add/teach a tool trigger in `src/services/mcpTools.js`
- Make sure `ChatInterface` handles the tool call and opens the correct artifact type


