import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/chatService';
import { parseToolCalls, cleanContentForDisplay } from '../services/mcpTools';
import ProjectCard from './ProjectCard';
import ArtifactOverlay from './ArtifactOverlay';
import projectData from '../data/projects.json';
import './ChatInterface.css';

const ChatInterface = ({ artifact, isArtifactOpen, openArtifact, closeArtifact }) => {
    // Start empty to show Hero view
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Execute tool calls from LLM response
    const executeTool = (tool, params) => {
        console.log('MCP Tool Call:', tool, params);
        
        switch (tool) {
            case 'open_artifact':
                const { type, id } = params;
                if (type === 'gallery') {
                    openArtifact('gallery', { images: [] }); // Placeholder for now
                } else if (type === 'project' && id) {
                    const project = projectData.find(p => p.id === id);
                    if (project) {
                        openArtifact('project', project);
                    }
                } else {
                    openArtifact('empty', null);
                }
                break;
            
            case 'close_artifact':
                closeArtifact();
                break;
            
            default:
                console.warn('Unknown tool:', tool);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const apiHistory = [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
        }));

        const responseMsg = await sendMessage(apiHistory);
        
        // Parse and execute any tool calls in the response
        const toolCalls = parseToolCalls(responseMsg.content);
        toolCalls.forEach(({ tool, params }) => {
            executeTool(tool, params);
        });
        
        // Clean the content for display (remove tool syntax)
        const cleanedContent = cleanContentForDisplay(responseMsg.content);
        const displayMsg = { ...responseMsg, content: cleanedContent || responseMsg.content };
        
        setMessages(prev => [...prev, displayMsg]);
        setIsLoading(false);
    };

    const renderMessageContent = (content) => {
        // Also handle inline DISPLAY_PROJECT tags
        const parts = content.split(/({{DISPLAY_PROJECT:\w+}})/g);
        
        return parts.map((part, i) => {
            if (part.startsWith('{{DISPLAY_PROJECT:')) {
                const projectId = part.replace('{{DISPLAY_PROJECT:', '').replace('}}', '');
                const project = projectData.find(p => p.id === projectId);
                
                if (project) {
                    return (
                        <div key={i} className="chat-project-embed">
                           <ProjectCard 
                                project={project} 
                                onClick={(p) => openArtifact('project', p)}
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

    return (
        <div className={`chat-container ${isHero ? 'mode-hero' : 'mode-chat'}`}>
            
            {/* Artifact Overlay */}
            <ArtifactOverlay 
                isOpen={isArtifactOpen} 
                onClose={closeArtifact} 
                artifact={artifact}
            />

            {/* Hero View - Only visible when no messages */}
            {isHero && (
                <div className="hero-center">
                    <h1 className="hero-logo">Portfolio</h1>
                    <p className="hero-subtitle">Ask me anything about Seymur's work.</p>
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
            <div className={`input-area ${isHero ? 'input-hero' : 'input-fixed'}`}>
                <form onSubmit={handleSend} className="input-form glass-panel">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about my projects..."
                        className="chat-input"
                        autoFocus
                    />
                    <button type="submit" className="send-btn" disabled={isLoading}>
                        →
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
