import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ onToggleArtifact }) => {
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const togglePin = () => setIsPinned(!isPinned);

    return (
        <div 
            className={`sidebar-container ${isPinned ? 'pinned' : ''} ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <div className="sidebar-logo">P</div>
                    {/* Only show pin button if expanded */}
                    <button className="pin-btn" onClick={togglePin}>
                        {isPinned ? '📌' : '📍'}
                    </button>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-item active" data-tooltip="New Chat">
                        <span className="icon">+</span>
                        <span className="label">New Chat</span>
                    </div>
                    <div className="nav-item" data-tooltip="Projects">
                        <span className="icon">📂</span>
                        <span className="label">Projects</span>
                    </div>
                    <div className="nav-item" onClick={onToggleArtifact} data-tooltip="Artifacts">
                        <span className="icon">📦</span>
                        <span className="label">Artifacts</span>
                    </div>
                    <div className="nav-item" data-tooltip="About">
                        <span className="icon">👤</span>
                        <span className="label">About</span>
                    </div>
                    <div className="nav-item">
                        <span className="icon">✉️</span>
                        <span className="label">Contact</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                   <div className="user-profile">
                        <div className="avatar">S</div>
                        <span className="label">Seymur M.</span>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
