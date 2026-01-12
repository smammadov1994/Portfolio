import React from 'react';
import './WebsiteView.css';

const WebsiteView = ({ url, title = 'Live Preview' }) => {
    const handleOpenExternal = () => {
        window.open(url, '_blank');
    };

    return (
        <div className="website-view">
            <div className="website-header">
                <div className="website-info">
                    <h2>{title}</h2>
                    <span className="website-url">{url}</span>
                </div>
                <div className="website-actions">
                    <button className="action-btn secondary" onClick={handleOpenExternal}>
                        Open in New Tab ↗
                    </button>
                </div>
            </div>
            
            <div className="iframe-container">
                <iframe 
                    src={url}
                    title={title}
                    className="website-iframe"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    loading="lazy"
                />
            </div>

            <div className="website-footer">
                <p className="iframe-note">
                    💡 This is a live preview. Some features may require opening in a new tab.
                </p>
            </div>
        </div>
    );
};

export default WebsiteView;
