import React from 'react';
import { Stage, Layer } from 'react-konva';
import RackComponent from './RackComponent';

const CanvasArea = ({
  cabinets,
  positions,
  setPositions,
  gridSize,
  labelMargin,
  labelAlignment,
  zoomLevel,
  productColors,
  onProductSelect,
  stageRef
}) => {
  const handleDragMove = (e, gridSize) => {
    const newX = gridSize > 0 ? Math.round(e.target.x() / gridSize) * gridSize : e.target.x();
    const newY = gridSize > 0 ? Math.round(e.target.y() / gridSize) * gridSize : e.target.y();
    e.target.x(newX);
    e.target.y(newY);
  };

  const handleDragEnd = (cabinet, e) => {
    const newX = Math.round(e.target.x()); // Yuvarlama hassasiyeti 1 piksel
    const newY = Math.round(e.target.y()); // Yuvarlama hassasiyeti 1 piksel
    const originalPosition = positions[cabinet] || { x: 0, y: 0 };
    // Eğer çok küçük bir sapma varsa (örneğin, 1 piksel), orijinal pozisyona geri dön
    const tolerance = 1; // Tolerans 1 piksel
    if (Math.abs(newX - originalPosition.x) <= tolerance && Math.abs(newY - originalPosition.y) <= tolerance) {
      e.target.x(originalPosition.x);
      e.target.y(originalPosition.y);
    }
    setPositions(prev => ({
      ...prev,
      [cabinet]: { x: newX, y: newY }
    }));
  };

  const cabinetCount = Object.keys(cabinets).length;
  const rows = Math.ceil(cabinetCount / 10);
  const cabinetHeight = 480; // Sabit küçültülmüş yükseklik
  const extraSpaceY = 100; // Satırlar arası ek boşluk
  const canvasHeight = rows * (cabinetHeight + extraSpaceY); // Dinamik yükseklik

  return (
    <div className="canvas-container" style={{ overflow: 'auto', maxHeight: '100vh' }}>
      <Stage
        width={window.innerWidth}
        height={canvasHeight}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        ref={stageRef}
      >
        <Layer>
          {Object.entries(cabinets).map(([cabinet, data], i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            const xPosition = col * 144; // 144 (kabin genişliği)
            const yPosition = row * (cabinetHeight + extraSpaceY);
            const position = positions[cabinet] || { x: xPosition, y: yPosition };

            return (
              <RackComponent
                key={cabinet}
                cabinet={cabinet}
                data={data}
                position={position}
                handleDragMove={(e) => handleDragMove(e, gridSize)}
                handleDragEnd={handleDragEnd}
                gridSize={gridSize}
                labelMargin={labelMargin}
                labelAlignment={labelAlignment}
                productColors={productColors}
                onProductSelect={onProductSelect}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasArea;