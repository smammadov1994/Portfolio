# Architecture overview

## High-level flow

1. User types into the chat UI (`ChatInterface`).
2. `src/services/chatService.js` calls the LLM.
3. The LLM response may include “tool calls” like:
   - `{{TOOL:open_artifact:type=gallery}}`
   - `{{TOOL:answer_about_me:topic=hobbies,question=...}}`
4. `ChatInterface` parses tool calls (`parseToolCalls`) and executes them:
   - Some tools open the artifact drawer (gallery, website, contact, etc.)
   - Some tools synthesize an answer locally from `me.json` (`answer_about_me`)

## Artifact drawer

`ArtifactOverlay` is a bottom drawer that renders one of:

- `GalleryView` (masonry)
- `WebsiteView` (iframe preview)
- `ContactView` (email composer UI; sending deferred)
- `Project` detail view

## Data sources

- `me.json`: canonical metadata about Seymur; used by `answer_about_me`
- `src/data/projects.json`: project cards and details
- `src/data/writings.json`: external writing links shown in the sidebar

## Cloudflare gallery

`GalleryView` can fetch image URLs from `src/services/cloudflareGallery.js`.

Notes:
- Public R2 hosts are not listing APIs.
- Use a JSON manifest or a Worker listing endpoint.
- Dev uses a Vite proxy (`/__cf_r2__`) to avoid CORS issues when fetching JSON.


