import { useState, useCallback } from 'react';

const useTilt = () => {
  const [transform, setTransform] = useState('');
  
  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation: center is (0,0), max rotation 15deg
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    
    const w = rect.width / 2;
    const h = rect.height / 2;
    
    const rotateX = ((y - h) / h) * -10; // Invert Y axis for correct feel
    const rotateY = ((x - w) / w) * 10;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  }, []);

  return { transform, handleMouseMove, handleMouseLeave };
};

export default useTilt;
