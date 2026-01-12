import React, { useEffect, useRef } from 'react';

const GalaxyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const stars = [];
    const NUM_STARS = 400; // Much fewer stars for minimalism
    
    // Mouse interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    
    // Re-initialize stars when screen resizes to prevent clumping
    const initStars = (w, h) => {
        stars.length = 0; // Clear existing
        for (let i = 0; i < NUM_STARS; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() < 0.9 ? Math.random() * 1.5 : Math.random() * 2.5,
                opacity: Math.random() * 0.5 + 0.1, 
                speed: (Math.random() * 0.3) + 0.05 
            });
        }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars(width, height); 
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let animationFrameId;

    const animate = () => {
      // Clear completely (black void)
      ctx.fillStyle = '#050505'; 
      ctx.fillRect(0, 0, width, height);
      
      stars.forEach(star => {
        // Move stars left to right (Planetary Spin)
        star.x += star.speed;

        // Wrap around screen
        if (star.x > width) {
            star.x = 0;
            star.y = Math.random() * height; // Randomize Y on re-entry
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1,
        background: '#050505'
      }} 
    />
  );
};

export default GalaxyBackground;
