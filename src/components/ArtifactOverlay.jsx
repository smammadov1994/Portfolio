import React, { useEffect, useState } from "react";
import GalleryView from "./GalleryView";
import WebsiteView from "./WebsiteView";
import ContactView from "./ContactView";
import "./ArtifactOverlay.css";

const ArtifactOverlay = ({ isOpen, onClose, artifact }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the drawer renders in closed state before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldAnimate(true);
        });
      });
    } else {
      setShouldAnimate(false);
      const timer = setTimeout(() => setIsVisible(false), 600); // Match close animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  // Render content based on artifact type
  const renderContent = () => {
    if (!artifact) {
      return (
        <div className="artifact-placeholder">
          <div className="placeholder-icon">📂</div>
          <h3>Ready for Content</h3>
          <p>Select an item to view its artifact.</p>
        </div>
      );
    }

    switch (artifact.type) {
      case "gallery":
        return <GalleryView images={artifact.data?.images || []} />;

      case "website":
        return (
          <WebsiteView
            url={artifact.data?.url}
            title={artifact.data?.title || "Live Preview"}
          />
        );

      case "contact":
        return <ContactView onClose={onClose} />;

      case "project":
        return (
          <div className="artifact-project-view">
            <div className="project-header">
              <h2 className="artifact-title">{artifact.data?.title}</h2>
              <span className="artifact-badge">Project Artifact</span>
            </div>

            <div className="project-details">
              <img
                src={artifact.data?.image}
                alt={artifact.data?.title}
                className="artifact-hero-image"
              />
              <p className="artifact-description">
                {artifact.data?.description}
              </p>

              <div className="artifact-stats">
                {artifact.data?.stats?.map((stat, i) => (
                  <div key={i} className="stat-pill glass-panel-sm">
                    <strong>{stat.label}</strong>: {stat.value}
                  </div>
                ))}
              </div>

              <div className="artifact-actions">
                <button
                  className="action-btn primary"
                  onClick={() =>
                    window.open(artifact.data?.githubUrl, "_blank")
                  }
                >
                  View Code
                </button>
                <button className="action-btn secondary">Live Demo</button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="artifact-placeholder">
            <div className="placeholder-icon">📂</div>
            <h3>Ready for Content</h3>
            <p>Select an item to view its artifact.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`artifact-overlay-backdrop ${shouldAnimate ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`artifact-drawer glass-panel ${shouldAnimate ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="artifact-header">
          <div className="artifact-pill"></div>
          <button className="artifact-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          className={`artifact-content ${
            artifact?.type === "website" ? "artifact-content--website" : ""
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ArtifactOverlay;
