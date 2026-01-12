import React, { useState, useRef, useEffect } from 'react';
import './LiquidGallery.css';

const LiquidGallery = () => {
  // Using high-quality unsplash images to match the reference vibe
  const images = [
    "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504198266287-1659872e6590?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504280509243-484d953164cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];

  // Duplicate images multiple times to ensure seamless infinite scroll
  // We need enough items to fill the screen + buffer for the animation loop
  const rawItems = [...images, ...images, ...images, ...images];
  
  const galleryItems = rawItems.map((src, i) => ({
    id: i,
    src
  }));

  const scrollContainerRef = useRef(null);

  // Optional: Add simple wheel/mouse integration to scroll horizontally
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="gallery-section">
      <h2 className="gallery-title">Visuals</h2>
      <div className="carousel-viewport" ref={scrollContainerRef}>
        <div className="carousel-track">
          {galleryItems.map((item) => (
            <div key={item.id} className="carousel-card">
              <div className="glass-pane">
                <img src={item.src} alt="Gallery" className="carousel-img" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiquidGallery;
