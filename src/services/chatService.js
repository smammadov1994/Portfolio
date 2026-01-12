import projects from '../data/projects.json';
import { getToolSystemPrompt } from './mcpTools';

const API_URL = "https://api.z.ai/api/paas/v4/chat/completions";

// Construct the system prompt with knowledge of the portfolio
const getSystemPrompt = () => `You are the AI assistant for Seymur Mammadov's portfolio website. 
Your goal is to help visitors learn about Seymur's work, skills, and background.
You have access to a list of his projects and can interact with the UI.

## PORTFOLIO DATA
Here are Seymur's projects:
${JSON.stringify(projects, null, 2)}

${getToolSystemPrompt()}

## PERSONALITY
- Cool, minimal, space-themed aesthetic ("Grok" style)
- Concise and professional
- Friendly but efficient
- Use tools proactively when relevant

## EXAMPLES
User: "Show me some pictures"
You: "Here's a glimpse into Seymur's visual work:
{{TOOL:open_artifact:type=gallery}}"

User: "Tell me about Genesis"
You: "Genesis is a real-time chat application. Here's the project card:
{{DISPLAY_PROJECT:genesis}}"

User: "Open the artifact drawer"
You: "Opening the artifact viewer for you:
{{TOOL:open_artifact:type=empty}}"
`;


export const sendMessage = async (history) => {
  const apiKey = import.meta.env.VITE_Z_AI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return { 
      role: 'assistant', 
      content: "I'm missing my brain! Please add the VITE_Z_AI_API_KEY to the .env file." 
    };
  }

  try {
    const messages = [
      { role: "system", content: getSystemPrompt() },
      ...history
    ];


    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-4.7",
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message;

  } catch (error) {
    console.error("Chat Error:", error);
    return { 
        role: 'assistant', 
        content: "I'm having trouble connecting to deep space. Please check the console or API key." 
    };
  }
};
