import React from 'react';

const ColorPicker = ({ position, onColorChange }) => {
    const colorOptions = [
      '#FF0000', '#FF4500', '#FF7F00', '#FFA500', '#FFC107', '#FFD700',
      '#FFFF00', '#F0E68C', '#ADFF2F', '#7FFF00', '#32CD32', '#228B22',
      '#008000', '#00FF00', '#00FA9A', '#00CED1', '#00B7EB', '#00BFFF',
      '#1E90FF', '#0000FF', '#00008B', '#483D8B', '#4B0082', '#8A2BE2',
      '#9400D3', '#FF00FF', '#C71585', '#FF1493', '#FF69B4', '#FFB6C1',
      '#DB7093', '#CD5C5C', '#A52A2A', '#8B0000', '#808080', '#D3D3D3'
    ];
  
    return (
      <div
        className="color-picker"
        style={{
          position: 'absolute',
          top: Math.max(150, position.y + 100),
          left: position.x + 10,
          padding: '0', // Boşlukları kaldırmak için padding sıfırlandı
          border: '1px solid #ccc',
          display: 'flex',
          flexWrap: 'wrap',
          width: '60px', // 6x6 için 6 * 10px = 60px
          backgroundColor: 'white',
          zIndex: 1000,
        }}
      >
        {colorOptions.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: '10px', // 10x10 kare boyutu
              height: '10px',
              backgroundColor: color,
              margin: '0', // Renkler arası boşluk kaldırıldı
              cursor: 'pointer',
            }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    );
  };
  
  export default ColorPicker;