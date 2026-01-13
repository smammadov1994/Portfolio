import React, { useState } from "react";
import GalaxyBackground from './components/GalaxyBackground';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import TopRightActions from "./components/TopRightActions";
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
      <Sidebar />
      <TopRightActions onOpenContact={() => openArtifact("contact", {})} />
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
