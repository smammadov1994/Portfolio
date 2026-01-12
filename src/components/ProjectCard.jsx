import React from 'react';
import useTilt from '../hooks/useTilt';
import useScrollReveal from '../hooks/useScrollReveal';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const { transform, handleMouseMove, handleMouseLeave } = useTilt();
  const { ref, isVisible } = useScrollReveal();

  return (
    <div 
      ref={ref}
      className={`project-card glass-panel ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
      onClick={() => onClick ? onClick(project) : window.open(project.githubUrl, '_blank')}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
    >
      <div className="card-image-container">
        <img src={project.image} alt={project.title} className="card-image" />
        <div className="card-overlay">
          <span className="view-text">View Code</span>
        </div>
      </div>
      
      <div className="card-content">
        <h2 className="card-title">{project.title}</h2>
        <p className="card-description">{project.description}</p>
        
        <div className="card-stats">
          {project.stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
