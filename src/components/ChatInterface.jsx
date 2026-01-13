import React, { useMemo, useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/chatService";
import { parseToolCalls, cleanContentForDisplay } from "../services/mcpTools";
import ProjectCard from "./ProjectCard";
import ArtifactOverlay from "./ArtifactOverlay";
import projectData from "../data/projects.json";
import me from "../../me.json";
import "./ChatInterface.css";

const INPUT_PLACEHOLDERS = [
  "Ask me about my life…",
  "See my life in a nutshell.",
  "Ask about my background story.",
  "Where have I traveled?",
  "Ask about my tech stack.",
  "What did I build at JobTarget?",
  "Ask about my AI work & automation.",
  "Show me Weaszel.",
  "Show me my UI components.",
  "View the gallery.",
  "What makes me unique?",
];

const ChatInterface = ({
  artifact,
  isArtifactOpen,
  openArtifact,
  closeArtifact,
}) => {
  // Start empty to show Hero view
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(() =>
    Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)
  );

  const activePlaceholder = useMemo(() => {
    return INPUT_PLACEHOLDERS[placeholderIndex] || "Ask about my projects...";
  }, [placeholderIndex]);

  // Rotate placeholder prompts while input is empty
  useEffect(() => {
    if (input.trim().length > 0) return;

    const interval = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % INPUT_PLACEHOLDERS.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatList = (arr) =>
    Array.isArray(arr) ? arr.filter(Boolean).join(", ") : "";

  const sentenceList = (arr) => {
    const xs = Array.isArray(arr) ? arr.filter(Boolean) : [];
    if (xs.length === 0) return "";
    if (xs.length === 1) return xs[0];
    if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
    return `${xs.slice(0, -1).join(", ")}, and ${xs[xs.length - 1]}`;
  };

  const stripParens = (s) =>
    String(s || "")
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .trim();

  const normalizeForDedupe = (s) =>
    stripParens(s)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const cleanAndDedupeList = (arr) => {
    const xs = Array.isArray(arr)
      ? arr
          .map(stripParens)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const seen = new Set();
    const out = [];
    for (const x of xs) {
      const key = normalizeForDedupe(x);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(x);
    }
    return out;
  };

  const buildAboutMeAnswer = ({ topic = "general", question = "" }) => {
    const q = String(question || "").toLowerCase();
    const t = String(topic || "general").toLowerCase();

    const p = me?.personal || {};
    const edu = me?.education || {};
    const skills = me?.technical_skills || {};
    const exp = Array.isArray(me?.work_experience) ? me.work_experience : [];
    const narrative = me?.background_narrative || {};
    const hobbies = me?.interests_and_hobbies || {};

    const inferTopic = () => {
      if (t && t !== "general") return t;
      if (/(email|contact|reach)/.test(q)) return "contact";
      if (/(where|location|live|based|from)/.test(q)) return "location";
      if (/(skill|stack|tech|typescript|react|aws|python|node)/.test(q))
        return "skills";
      if (/(experience|work|job|career|jobtarget|tech lead)/.test(q))
        return "experience";
      if (/(school|degree|education|university|sacred heart)/.test(q))
        return "education";
      if (/(immigr|story|background|born|pivot)/.test(q)) return "background";
      if (/(hobby|fun|outside|games|soccer|gym)/.test(q)) return "hobbies";
      return "general";
    };

    const finalTopic = inferTopic();

    switch (finalTopic) {
      case "contact":
        return `You can reach Seymur at **${
          p?.contact?.email || "his email on the site"
        }**.`;

      case "location":
        return `Seymur is currently based in **${
          p?.location?.current || "the US"
        }**. He was born in **${
          p?.location?.birthplace || "Azerbaijan"
        }** and grew up in **${p?.location?.upbringing || "Connecticut"}**.`;

      case "education":
        return `Education: **${edu?.degree || "B.S."}**, **${
          edu?.institution || "Sacred Heart University"
        }** (${edu?.location || ""}${
          edu?.graduation_date ? `, ${edu.graduation_date}` : ""
        }).`;

      case "skills": {
        const langs = sentenceList(skills.languages_and_frameworks);
        const cloud = sentenceList(skills.cloud_and_infrastructure);
        const db = sentenceList(skills.databases);
        const ai = sentenceList(skills.ai_and_automation);
        const parts = [];
        if (langs) parts.push(`He works primarily with ${langs}.`);
        if (cloud)
          parts.push(
            `On the infrastructure side, he’s comfortable with ${cloud}.`
          );
        if (db) parts.push(`For data, he has experience with ${db}.`);
        if (ai)
          parts.push(`He also builds AI + automation workflows using ${ai}.`);
        return parts.join(" ");
      }

      case "experience": {
        const lines = exp.slice(0, 3).map((r) => {
          const oneWin = Array.isArray(r.key_achievements)
            ? r.key_achievements[0]
            : "";
          return {
            title: r.title,
            company: r.company,
            duration: r.duration,
            win: oneWin,
          };
        });
        const chunks = lines.map((r) => {
          const base = `${r.title} at ${r.company} (${r.duration})`;
          if (!r.win) return `${base}.`;
          const winLower = r.win.replace(/^[A-Z]/, (c) => c.toLowerCase());
          return `${base}, where he ${winLower}`;
        });
        return `Seymur has built and led full-stack products across multiple teams. ${chunks.join(
          " "
        )}`.trim();
      }

      case "background":
        return `${narrative.origin_story || ""}\n\n${
          narrative.education_pivot || ""
        }`.trim();

      case "hobbies": {
        const physical = cleanAndDedupeList(hobbies.physical_activities).filter(
          (x) => normalizeForDedupe(x) !== "staying active"
        );
        const culinaryRaw = cleanAndDedupeList(hobbies.culinary);
        const games = sentenceList(
          cleanAndDedupeList(hobbies.gaming?.favorite_games)
        );

        const phys = sentenceList(physical);
        const mentionsCooking = culinaryRaw.some((x) =>
          normalizeForDedupe(x).includes("cook")
        );
        const mentionsFood = culinaryRaw.some((x) =>
          normalizeForDedupe(x).includes("food")
        );

        const parts = [];
        if (phys)
          parts.push(
            `When he’s not working, Seymur likes staying active — ${phys}.`
          );

        if (mentionsFood || mentionsCooking) {
          if (mentionsFood && mentionsCooking) {
            parts.push("He also enjoys food and cooking.");
          } else if (mentionsCooking) {
            parts.push("He also enjoys cooking.");
          } else {
            parts.push("He also enjoys good food.");
          }
        }

        if (games)
          parts.push(
            `He grew up a big gamer, and some of his favorites include ${games}.`
          );
        return parts.join(" ");
      }

      default: {
        const headline =
          me?.professional_summary?.headline ||
          "Experienced technical leader and builder.";
        const loc = p?.location?.current
          ? `Based in **${p.location.current}**.`
          : "";
        const yrs = me?.notable_metrics?.years_of_experience
          ? `**${me.notable_metrics.years_of_experience}** years of experience.`
          : "";
        const langs = formatList(skills.languages_and_frameworks);
        return `${headline}\n\n${[loc, yrs]
          .filter(Boolean)
          .join(" ")}\n\nCore tech: **${langs || "JavaScript/React/Node"}**.`;
      }
    }
  };

  // Execute tool calls from LLM response
  const executeTool = (tool, params) => {
    console.log("MCP Tool Call:", tool, params);

    switch (tool) {
      case "open_artifact": {
        const { type, id, url } = params;
        if (type === "gallery") {
          openArtifact("gallery", { images: [] });
        } else if (type === "contact") {
          openArtifact("contact", {});
        } else if (type === "website" && url) {
          // Website preview with iframe
          const rawTitle = params?.title;
          let title =
            rawTitle && String(rawTitle).trim()
              ? String(rawTitle).trim()
              : "Live Preview";
          const urlLower = String(url).toLowerCase();
          if (!rawTitle) {
            if (urlLower.includes("weaszel.com")) title = "Weaszel";
            if (urlLower.includes("chatbot-ui-components"))
              title = "Chatbot UI Components";
          }
          openArtifact("website", { url, title });
        } else if (type === "project" && id) {
          const project = projectData.find((p) => p.id === id);
          if (project) {
            openArtifact("project", project);
          }
        } else {
          openArtifact("empty", null);
        }
        return null;
      }

      case "close_artifact":
        closeArtifact();
        return null;

      case "answer_about_me": {
        const answer = buildAboutMeAnswer({
          topic: params?.topic || "general",
          question: params?.question || "",
        });
        return { role: "assistant", content: answer };
      }

      default:
        console.warn("Unknown tool:", tool);
        return null;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const apiHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const responseMsg = await sendMessage(apiHistory);

    // Parse and execute any tool calls in the response
    const toolCalls = parseToolCalls(responseMsg.content);
    const toolMessages = [];
    toolCalls.forEach(({ tool, params }) => {
      const maybeMsg = executeTool(tool, params);
      if (maybeMsg?.content) toolMessages.push(maybeMsg);
    });

    // Clean the content for display (remove tool syntax)
    const cleanedContent = cleanContentForDisplay(responseMsg.content);
    const cleanedTrimmed = cleanedContent.trim();

    const out = [];
    if (cleanedTrimmed.length > 0)
      out.push({ ...responseMsg, content: cleanedTrimmed });
    out.push(...toolMessages);

    if (out.length > 0) setMessages((prev) => [...prev, ...out]);
    setIsLoading(false);
  };

  const renderMessageContent = (content) => {
    // Also handle inline DISPLAY_PROJECT tags
    const parts = content.split(/({{DISPLAY_PROJECT:\w+}})/g);

    return parts.map((part, i) => {
      if (part.startsWith("{{DISPLAY_PROJECT:")) {
        const projectId = part
          .replace("{{DISPLAY_PROJECT:", "")
          .replace("}}", "");
        const project = projectData.find((p) => p.id === projectId);

        if (project) {
          return (
            <div key={i} className="chat-project-embed">
              <ProjectCard
                project={project}
                onClick={(p) => openArtifact("project", p)}
              />
            </div>
          );
        }
        return null;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const isHero = messages.length === 0;

  // Multiple sets of starter prompts
  const promptSets = [
    [
      { emoji: "🚀", text: "What projects has Seymur built?" },
      { emoji: "🌐", text: "Show me Weaszel" },
      { emoji: "🖼️", text: "View the gallery" },
      { emoji: "💼", text: "Tell me about Seymur's experience" },
    ],
    [
      { emoji: "🧠", text: "What's Seymur's tech stack?" },
      { emoji: "📱", text: "Show me mobile projects" },
      { emoji: "🎨", text: "What's his design philosophy?" },
      { emoji: "🔥", text: "What's he working on now?" },
    ],
    [
      { emoji: "🎓", text: "Where did Seymur study?" },
      { emoji: "💡", text: "What problems does he solve?" },
      { emoji: "🤝", text: "How can I contact him?" },
      { emoji: "⚡", text: "What makes him unique?" },
    ],
  ];

  const [promptSetIndex, setPromptSetIndex] = useState(0);
  const currentPrompts = promptSets[promptSetIndex];

  const cyclePrompts = () => {
    setPromptSetIndex((prev) => (prev + 1) % promptSets.length);
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    // Auto-submit after a tiny delay for visual feedback
    setTimeout(() => {
      setInput(prompt);
      const submitBtn = document.querySelector(".send-btn");
      if (submitBtn) submitBtn.click();
    }, 100);
  };

  return (
    <div className={`chat-container ${isHero ? "mode-hero" : "mode-chat"}`}>
      {/* Artifact Overlay */}
      <ArtifactOverlay
        isOpen={isArtifactOpen}
        onClose={closeArtifact}
        artifact={artifact}
      />

      {/* Hero View - Only visible when no messages */}
      {isHero && (
        <div className="hero-center">
          <h1 className="hero-logo">A Hitchhiker's Guide to My Fallacy</h1>
          <p className="hero-subtitle">Ask me anything (I might be wrong).</p>
        </div>
      )}

      {/* Chat Stream - Only visible when there are messages */}
      {!isHero && (
        <div className="chat-scroll-area">
          <div className="chat-stream">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-bubble glass-panel-sm">
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="loading-container">
                  <div className="grok-pulse"></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input Area - Centered in Hero, Fixed Bottom in Chat */}
      <div className={`input-area ${isHero ? "input-hero" : "input-fixed"}`}>
        <form onSubmit={handleSend} className="input-form glass-panel">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activePlaceholder}
            className="chat-input"
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={isLoading}>
            →
          </button>
        </form>

        {/* Prompts moved here to be below input in hero mode */}
        {isHero && (
          <div className="starter-prompts" key={promptSetIndex}>
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="starter-chip"
                onClick={() => handlePromptClick(prompt.text)}
              >
                <span className="chip-emoji">{prompt.emoji}</span>
                <span className="chip-text">{prompt.text}</span>
              </button>
            ))}
            <button
              className="starter-chip refresh-chip"
              onClick={cyclePrompts}
              title="More suggestions"
            >
              <span className="refresh-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className="refresh-path-primary"
                    d="M12.0789 3V2.25V3ZM3.67981 11.3333H2.92981H3.67981ZM3.67981 13L3.15157 13.5324C3.44398 13.8225 3.91565 13.8225 4.20805 13.5324L3.67981 13ZM5.88787 11.8657C6.18191 11.574 6.18377 11.0991 5.89203 10.8051C5.60029 10.511 5.12542 10.5092 4.83138 10.8009L5.88787 11.8657ZM2.52824 10.8009C2.2342 10.5092 1.75933 10.511 1.46759 10.8051C1.17585 11.0991 1.17772 11.574 1.47176 11.8657L2.52824 10.8009ZM18.6156 7.39279C18.8325 7.74565 19.2944 7.85585 19.6473 7.63892C20.0001 7.42199 20.1103 6.96007 19.8934 6.60721L18.6156 7.39279ZM12.0789 2.25C7.03155 2.25 2.92981 6.3112 2.92981 11.3333H4.42981C4.42981 7.15072 7.84884 3.75 12.0789 3.75V2.25ZM2.92981 11.3333L2.92981 13H4.42981L4.42981 11.3333H2.92981ZM4.20805 13.5324L5.88787 11.8657L4.83138 10.8009L3.15157 12.4676L4.20805 13.5324ZM4.20805 12.4676L2.52824 10.8009L1.47176 11.8657L3.15157 13.5324L4.20805 12.4676ZM19.8934 6.60721C18.287 3.99427 15.3873 2.25 12.0789 2.25V3.75C14.8484 3.75 17.2727 5.20845 18.6156 7.39279L19.8934 6.60721Z"
                  />
                  <path
                    className="refresh-path-secondary"
                    d="M11.8825 21V21.75V21ZM20.3137 12.6667H21.0637H20.3137ZM20.3137 11L20.8409 10.4666C20.5487 10.1778 20.0786 10.1778 19.7864 10.4666L20.3137 11ZM18.1002 12.1333C17.8056 12.4244 17.8028 12.8993 18.094 13.1939C18.3852 13.4885 18.86 13.4913 19.1546 13.2001L18.1002 12.1333ZM21.4727 13.2001C21.7673 13.4913 22.2421 13.4885 22.5333 13.1939C22.8245 12.8993 22.8217 12.4244 22.5271 12.1332L21.4727 13.2001ZM5.31769 16.6061C5.10016 16.2536 4.63806 16.1442 4.28557 16.3618C3.93307 16.5793 3.82366 17.0414 4.0412 17.3939L5.31769 16.6061ZM11.8825 21.75C16.9448 21.75 21.0637 17.6915 21.0637 12.6667H19.5637C19.5637 16.8466 16.133 20.25 11.8825 20.25V21.75ZM21.0637 12.6667V11H19.5637V12.6667H21.0637ZM19.7864 10.4666L18.1002 12.1333L19.1546 13.2001L20.8409 11.5334L19.7864 10.4666ZM19.7864 11.5334L21.4727 13.2001L22.5271 12.1332L20.8409 10.4666L19.7864 11.5334ZM4.0412 17.3939C5.65381 20.007 8.56379 21.75 11.8825 21.75V20.25C9.09999 20.25 6.6656 18.7903 5.31769 16.6061L4.0412 17.3939Z"
                  />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
