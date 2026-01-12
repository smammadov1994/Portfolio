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

    // Shooting star state
    let shootingStar = null;
    let nextShootingStarTime = Date.now() + Math.random() * 5000 + 3000; // 3-8 seconds

    const createShootingStar = () => {
        // Random starting edge: top or left side of screen
        const fromTop = Math.random() > 0.5;
        
        let startX, startY, angle;
        
        if (fromTop) {
            // Start from top edge, travel diagonally down-right
            startX = Math.random() * width * 0.8;
            startY = -10;
            angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // 30-60 degrees
        } else {
            // Start from left edge, travel diagonally right-down
            startX = -10;
            startY = Math.random() * height * 0.6;
            angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4; // 15-45 degrees
        }
        
        return {
            x: startX,
            y: startY,
            length: 60 + Math.random() * 80, // Varied tail length
            speed: 10 + Math.random() * 12,
            angle: angle,
            opacity: 1,
            life: 1
        };
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
      
      // Draw stars
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

      // Shooting star logic
      const now = Date.now();
      if (!shootingStar && now > nextShootingStarTime) {
          shootingStar = createShootingStar();
      }

      if (shootingStar) {
          // Move shooting star
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.life -= 0.015;
          shootingStar.opacity = shootingStar.life;

          if (shootingStar.life > 0) {
              // Draw shooting star with gradient tail
              const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
              const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

              const gradient = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
              gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
              gradient.addColorStop(0.7, `rgba(255, 255, 255, ${shootingStar.opacity * 0.3})`);
              gradient.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.opacity})`);

              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2;
              ctx.lineCap = 'round';
              ctx.moveTo(tailX, tailY);
              ctx.lineTo(shootingStar.x, shootingStar.y);
              ctx.stroke();

              // Bright head
              ctx.beginPath();
              ctx.fillStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
              ctx.arc(shootingStar.x, shootingStar.y, 2, 0, Math.PI * 2);
              ctx.fill();
          } else {
              shootingStar = null;
              nextShootingStarTime = now + Math.random() * 5000 + 3000; // Next one in 3-8 seconds
          }
      }

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
