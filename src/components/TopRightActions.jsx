import React from "react";
import "./TopRightActions.css";

const DEFAULT_GITHUB_URL = "https://github.com/smammadov1994";
// Replace with your actual profile URL if you prefer (this is a placeholder-safe default).
const DEFAULT_LINKEDIN_URL = "https://www.linkedin.com/in/seymur-mammadov/";

const TopRightActions = ({ onOpenContact }) => {
  return (
    <div className="top-actions">
      <a
        className="top-action-btn"
        href={DEFAULT_GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Open GitHub"
        title="GitHub"
      >
        <span
          className="top-action-icon top-action-icon--github"
          aria-hidden="true"
        />
      </a>

      <a
        className="top-action-btn"
        href={DEFAULT_LINKEDIN_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Open LinkedIn"
        title="LinkedIn"
      >
        <span
          className="top-action-icon top-action-icon--linkedin"
          aria-hidden="true"
        />
      </a>

      <button
        type="button"
        className="top-action-btn"
        onClick={onOpenContact}
        aria-label="Contact"
        title="Contact"
      >
        <span
          className="top-action-icon top-action-icon--mail"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default TopRightActions;
