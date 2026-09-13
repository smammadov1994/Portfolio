<div align="center">

# Seymur Mammadov
### A portfolio with a little personality.

Graphite artwork. Handwritten stories. A curious weasel. A ghost who goes fishing.

[Explore the portfolio](https://seymur-mammadov-portfolio.smammadov494.chatgpt.site) · [Weaszel Swagger reference](https://weaszel-youtube-swagger.smammadov494.chatgpt.site)

*The hosted sites currently require the owner's ChatGPT account.*

</div>

![Weaszel exploring a world of browser windows, illustrated in graphite](dist/assets/weaszel-graphite.png)

## Meet the cast

**Astro** fishes up little pieces of my story. Catch a bite and a thought bubble opens beside him. Further down, he introduces my background and answers questions from the portfolio's local profile data.

**Weaszel** leads the featured work with a 30-second, scroll-controlled Remotion film. He runs in, stops to look at you, investigates the page, taps a tool into shape, and jumps behind the card before settling on its corner. One character, with distinct actions throughout the story.

![Weaszel's eight acting poses: eye contact, curiosity, investigation, reaching, crouching, jumping, landing, and perching](dist/assets/weasel-acting.png)

The film explains the website-to-MCP adapter prototype: observe a page and its controls, describe useful actions as tools, inspect the generated OpenAPI reference, and call the local adapter. The portfolio illustrates that workflow; it does not run the adapter in the hosted page.

## PumpAds AI — building a business

I co-founded PumpAds AI with my partners to turn product ideas into creator-style video ads. The second featured story uses three monochrome creator cards to walk through the creative and production process.

<table>
  <tr>
    <td width="33%"><img src="dist/assets/pumpads-skincare.png" alt="Illustrative AI creator presenting a skincare bottle" width="100%"></td>
    <td width="33%"><img src="dist/assets/pumpads-tumbler.png" alt="Illustrative AI creator presenting a travel tumbler" width="100%"></td>
    <td width="33%"><img src="dist/assets/pumpads-headphones.png" alt="Illustrative AI creator presenting headphones" width="100%"></td>
  </tr>
  <tr><td align="center">Skincare</td><td align="center">Everyday essentials</td><td align="center">Audio</td></tr>
</table>

*AI-generated illustrative creator concepts, not actual customer campaigns.*

Our shared company results included:

- **1,000+ paying customers** and **$15K in monthly revenue** within two months of launch.
- Average generation time reduced from **10 minutes to 2 minutes**.
- Support for bursts of **100 concurrent requests** through independently scalable services and persistent job state.

The pipeline combined script generation, voice cloning, image and video generation, lip sync, revoicing, and FFmpeg assembly. The portfolio also covers the credit ledger, automatic refunds, and infrastructure work behind the product.

## How the portfolio works

| Part | Implementation |
| --- | --- |
| Page and styling | Static HTML, CSS, graphite imagery, and Caveat typography |
| Scroll films | React + Remotion Player, driven by a frame timeline |
| Playback controls | Scroll scrubbing, play/pause, chapter navigation, and a timeline slider |
| Responsive motion | Desktop and mobile compositions, plus a reduced-motion reading mode |
| Astro's answers | Local profile data and keyword-based retrieval; no remote LLM call |
| Text reveals | A custom typewriter with reserved layout space |
| Build | esbuild bundles both animation entry points with shared dependencies |
| Hosting | ChatGPT Sites, serving the `dist/` directory |

![The paper browser landscape behind Weaszel's adventure](dist/assets/weasel-world.png)

## Run locally

Use Node.js 20 or newer and Python 3 for the static preview server.

```bash
npm ci
npm run build
python3 -m http.server 8080 --directory dist
```

Open [localhost:8080](http://localhost:8080). Serve from the site root so the animation assets resolve correctly. No API keys are required for the portfolio.

The HTML and CSS in `dist/` are authored files and are intentionally tracked. The build updates the JavaScript bundles without deleting the page or artwork. After editing a React composition, run `npm run build` again.

## Where to edit

| File | Purpose |
| --- | --- |
| `dist/index.html` | Portfolio content, project order, and Astro's fishing interaction |
| `src/weasel-story.jsx` | Weaszel's acting, scene content, and scroll controls |
| `src/pumpads-story.jsx` | PumpAds creator cards and animated business story |
| `dist/weasel-story.css` | Weaszel section layout and responsive styling |
| `dist/pumpads-story.css` | PumpAds section layout and responsive styling |
| `dist/astro-guide.css` | Handwritten theme, guide, and thought bubble |
| `dist/astro-guide.js` | Scroll narration and profile questions |
| `dist/knowledge.mjs` | Profile knowledge and local retrieval |
| `dist/typewriter.mjs` | Text reveal behavior |
| `dist/data/` | Profile and project information |
| `dist/assets/` | Artwork, sprite sheets, and compiled animation bundles |
| `scripts/build.mjs` | Shared esbuild configuration |

The `.openai/hosting.json` file identifies this existing Sites project. GitHub stores the source; a push to GitHub alone does not deploy the portfolio.

---

Built by **Seymur Mammadov** — full-stack engineering, applied AI, and a little playfulness.
