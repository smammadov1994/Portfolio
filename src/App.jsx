import React, { useState } from 'react';
import projectsData from './data/projects.json';
import GalaxyBackground from './components/GalaxyBackground';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  // Artifact State (Lifted)
  const [artifact, setArtifact] = useState(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);

  const openArtifact = (type, data) => {
      setArtifact({ type, data });
      setIsArtifactOpen(true);
  };

  const closeArtifact = () => {
      setIsArtifactOpen(false);
  };

  const toggleArtifact = () => {
      if (isArtifactOpen) {
          closeArtifact();
      } else {
          // Open plain if no artifact set, or keep existing
          setIsArtifactOpen(true);
      }
  };

  return (
    <div className="app-container">
      <GalaxyBackground />
      <Sidebar onToggleArtifact={toggleArtifact} />
      <ChatInterface 
        artifact={artifact}
        isArtifactOpen={isArtifactOpen}
        openArtifact={openArtifact}
        closeArtifact={closeArtifact}
      />
    </div>
  );
}

export default App;
