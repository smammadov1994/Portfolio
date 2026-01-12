import React from 'react';
import './GalleryView.css';

// Placeholder colors until real images are added
const PLACEHOLDER_COLORS = [
    '#3a3d5c', '#4a4d7c', '#5a5d8c', '#6a6d9c',
    '#2a2d4c', '#3a4d6c', '#4a5d7c', '#5a6d8c',
    '#2a3d5c', '#3a4d7c', '#4a5d9c', '#5a6dac',
    '#3a2d4c', '#4a3d6c', '#5a4d8c', '#6a5d9c',
];

const GalleryView = ({ images = [] }) => {
    // Use placeholder colored squares if no images provided
    const items = images.length > 0 
        ? images 
        : PLACEHOLDER_COLORS.map((color, i) => ({ 
            id: i, 
            type: 'placeholder', 
            color,
            height: Math.floor(Math.random() * 150) + 200 // Random heights for masonry
        }));

    return (
        <div className="gallery-view">
            <div className="gallery-header">
                <h2>Visual Portfolio</h2>
                <p className="gallery-subtitle">A collection of Seymur's work and moments</p>
            </div>
            
            <div className="masonry-grid">
                {items.map((item, index) => (
                    <div 
                        key={item.id || index}
                        className="masonry-item"
                        style={{ 
                            backgroundColor: item.color || '#3a3d5c',
                            height: item.height || 250
                        }}
                    >
                        {item.type === 'placeholder' ? (
                            <div className="placeholder-content">
                                <span className="placeholder-icon">🖼️</span>
                            </div>
                        ) : (
                            <img src={item.src} alt={item.alt || 'Gallery image'} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryView;
