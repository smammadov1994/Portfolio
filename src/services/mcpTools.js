/**
 * MCP Tools Layer
 * Defines available tools and parses/executes tool calls from LLM responses
 */

// Tool definitions - describes what tools are available to the LLM
export const TOOL_DEFINITIONS = [
  {
    name: "open_artifact",
    description: "Opens the artifact drawer to display content",
    parameters: {
      type: {
        type: "string",
        enum: ["project", "gallery", "website", "contact", "empty"],
        description: "Type of content to display",
      },
      id: {
        type: "string",
        description: "ID of the item (for project type)",
        optional: true,
      },
      url: {
        type: "string",
        description: "URL to load (for website type)",
        optional: true,
      },
      title: {
        type: "string",
        description: "Optional title for website preview",
        optional: true,
      },
    },
  },
  {
    name: "close_artifact",
    description: "Closes the artifact drawer",
    parameters: {},
  },
  {
    name: "display_project",
    description: "Displays a project card inline in the chat",
    parameters: {
      id: {
        type: "string",
        description: "Project ID to display",
      },
    },
  },
  {
    name: "answer_about_me",
    description:
      "Answers questions about Seymur using the local 'me.json' profile data (no guessing).",
    parameters: {
      topic: {
        type: "string",
        enum: [
          "general",
          "skills",
          "experience",
          "education",
          "background",
          "hobbies",
          "location",
          "contact",
        ],
        description: "Which part of the profile to use",
      },
      question: {
        type: "string",
        description:
          "Optional: the user question (can be used for better targeting)",
        optional: true,
      },
    },
  },
];

// Generate system prompt section for tools
export const getToolSystemPrompt = () => {
  return `
## AVAILABLE TOOLS

You have access to the following tools to interact with the portfolio interface:

### 1. open_artifact
Opens a fullscreen artifact drawer. Use this when the user wants to see visual content.
**Syntax:** {{TOOL:open_artifact:type=<type>,id=<id>,url=<url>}}

**Types:**
- type=project,id=<project_id> - Shows detailed project view
- type=gallery - Shows a masonry grid of Seymur's photos/work
- type=website,url=<url> - Shows a live website preview in an iframe
- type=contact - Opens a contact composer
- type=empty - Opens empty drawer

**When to use:**
- User asks to "show pictures", "see photos", "view gallery" → type=gallery
- User asks to "open artifact", "show the drawer" → type=empty
- User asks about a specific project in detail → type=project,id=<id>
- User asks to "view weaszel", "show weaszel", "try weaszel" → type=website,url=https://weaszel.com/
- User asks to "contact", "email", "reach out" → type=contact

### Known Website Projects:
- **Weaszel** - An AI-powered browser extension. URL: https://weaszel.com/
  - Trigger words: "weaszel", "browser extension", "try weaszel", "view weaszel"

- **Chatbot UI Components** - A UI components/storybook showcase. URL: https://smammadov1994.github.io/chatbot-ui-components/?path=/story/getting-started--introduction
  - Trigger words: "UI components", "UI library", "component library", "storybook", "design system"

### 2. close_artifact
Closes the artifact drawer.
**Syntax:** {{TOOL:close_artifact}}

### 3. display_project (inline)
Shows a project card directly in the chat message.
**Syntax:** {{DISPLAY_PROJECT:<project_id>}}

### 4. answer_about_me
Answer a user question about Seymur using the local profile JSON (me.json). Use this for biography, skills, experience, education, background story, hobbies, location, and contact info.
**Syntax:** {{TOOL:answer_about_me:topic=<topic>,question=<user_question>}}

**Topics:** general | skills | experience | education | background | hobbies | location | contact

## IMPORTANT RULES:
1. ALWAYS use the exact syntax shown above
2. Tools like open_artifact should be on their own line
3. You can combine text with tool calls naturally
4. For weaszel, ALWAYS use the website preview to let users try it
5. When the user asks general questions about Seymur (bio/skills/experience/etc.), prefer answer_about_me instead of guessing.

Example response for "show me weaszel" or "I want to view the weaszel project":
"Weaszel is an AI-powered browser extension I built. Let me show you the live site:
{{TOOL:open_artifact:type=website,url=https://weaszel.com/}}"

Example response for "did you build a UI library?" or "show me your UI components":
"Yep — here’s a live preview of my UI components:
{{TOOL:open_artifact:type=website,url=https://smammadov1994.github.io/chatbot-ui-components/?path=/story/getting-started--introduction,title=Chatbot UI Components}}"

Example response for "show me some pictures":
"Here's a glimpse into Seymur's visual work:
{{TOOL:open_artifact:type=gallery}}"

Example response for "how can I contact you?" or "can I email you?":
"Sure — you can write a note here:
{{TOOL:open_artifact:type=contact}}"
`;
};

// Parse tool calls from LLM response
export const parseToolCalls = (content) => {
  const toolCalls = [];

  // Match {{TOOL:name:params}} pattern - using non-greedy match
  const toolRegex = /\{\{TOOL:(\w+)(?::([^}]*))?\}\}/g;
  let match;

  console.log("MCP: Parsing content for tool calls:", content);

  while ((match = toolRegex.exec(content)) !== null) {
    const toolName = match[1];
    const paramsString = match[2] || "";

    console.log(
      "MCP: Found tool match:",
      match[0],
      "Tool:",
      toolName,
      "Params:",
      paramsString
    );

    // Parse params (key=value,key=value format)
    // Values may contain commas; we treat comma-separated segments without '=' as part of the previous value.
    const params = {};
    if (paramsString) {
      let lastKey = null;
      paramsString.split(",").forEach((segment) => {
        const trimmed = segment.trim();
        if (!trimmed) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const value = trimmed.slice(eqIdx + 1).trim();
          if (key) {
            params[key] = value;
            lastKey = key;
          }
        } else if (lastKey) {
          params[lastKey] = `${params[lastKey]},${trimmed}`;
        }
      });
    }

    toolCalls.push({
      tool: toolName,
      params,
      fullMatch: match[0],
    });
  }

  console.log("MCP: Total tool calls found:", toolCalls.length, toolCalls);
  return toolCalls;
};

// Remove tool call syntax from display text
// NOTE: Keep {{DISPLAY_ALL_PROJECTS}} and {{DISPLAY_PROJECT:...}} — they're rendered by renderMessageContent
export const cleanContentForDisplay = (content) => {
  const cleaned = content
    .replace(/\{\{TOOL:\w+(?::[^}]*)?\}\}/g, "")
    .trim();
  console.log("MCP: Cleaned content:", cleaned);
  return cleaned;
};
