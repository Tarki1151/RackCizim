import React, { useState } from 'react';
import { Group, Rect, Text, Line } from 'react-konva';

const RackComponent = ({ 
  cabinet, 
  data, 
  position, 
  handleDragMove, 
  handleDragEnd, 
  gridSize, 
  labelMargin, 
  labelAlignment,
  productColors,
  onProductSelect
}) => {
  const rackHeight = 42;
  const frameTop = 19.2; // Sabit küçültülmüş değer
  const frameBottom = 480; // Sabit küçültülmüş değer
  const innerHeight = frameBottom - frameTop; // 460.8
  const uHeight = innerHeight / rackHeight; // 460.8 / 42 ≈ 10.973
  const cabinetWidth = 144; // Sabit küçültülmüş genişlik
  const productWidth = 112; // Sabit küçültülmüş genişlik
  const productXOffset = 18; // Ürünlerin x pozisyonu, 16’dan 18’e kaydırıldı (2 piksel sağa)
  const [tooltip, setTooltip] = useState(null);

  let adjustedData = Array.isArray(data) && data.length > 0
    ? data
        .map(item => {
          const rackStr = String(item.Rack || '').trim();
          const uStr = String(item.U || '').trim().toUpperCase();
          const startU = rackStr && rackStr.match(/\d+/) ? parseInt(rackStr) : null;
          const u = uStr === 'BLADE' || !uStr.match(/\d+/) ? null : parseFloat(uStr);
          return { ...item, Rack: startU, U: u };
        })
        .filter(item => item && item.Rack > 0 && item.Rack <= rackHeight && item.U > 0 && item.BrandModel)
    : [];

  const maxU = adjustedData.length > 0
    ? Math.max(...adjustedData.map(item => item.Rack + item.U - 1))
    : rackHeight;

  const isFullRack = maxU > rackHeight;

  const handleMouseEnter = (e, item) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const rawOwner = item.Owner || 'Bilinmiyor';
    const formattedOwner = rawOwner.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    const owner = formattedOwner.length > 15 ? formattedOwner.slice(0, 15) + '..' : formattedOwner;
    setTooltip({
      x: pointerPosition.x - position.x,
      y: pointerPosition.y - position.y,
      owner: owner,
      serial: item.Serial || 'Bilinmiyor'
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const formatProductName = (name, u) => {
    const formattedName = name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    if (u === 1 && formattedName.length > 25) {
      return formattedName.slice(0, 25) + '..';
    }
    return formattedName;
  };

  const handleProductClick = (e, index) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    onProductSelect(cabinet, index, pointerPosition.x, pointerPosition.y);
  };

  // Ürün pozisyonlarını dinamik olarak hesapla
  const calculateProductY = (item, index, adjustedData) => {
    const startU = item.Rack;
    const u = Math.min(item.U, rackHeight - (startU - 1));
    const previousItem = index > 0 ? adjustedData[index - 1] : null;

    if (previousItem) {
      const previousStartU = previousItem.Rack;
      const previousU = Math.min(previousItem.U, rackHeight - (previousStartU - 1));
      const previousEndU = previousStartU + previousU;

      if (previousEndU === startU) {
        // Bitişik ürünler: Boşluk yok
        return frameBottom - (previousStartU - 1 + previousU) * uHeight - (u * uHeight);
      } else {
        // Boşluklu ürünler: Orijinal boşluk korunur
        const originalGap = (startU - previousEndU) * uHeight;
        return frameBottom - (previousStartU - 1 + previousU) * uHeight - originalGap - (u * uHeight);
      }
    } else {
      // İlk ürün: 42U’dan yukarı doğru hizalı
      return frameBottom - (startU - 1 + u) * uHeight;
    }
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={(e) => handleDragEnd(cabinet, e)}
    >
      <Text
        text={cabinet}
        width={cabinetWidth}
        fontSize={16}
        align={labelAlignment}
        y={6 - labelMargin}
      />
      <Rect x={0} y={frameTop} width={cabinetWidth} height={innerHeight} stroke="black" strokeWidth={2} fill="transparent" />
      {Array.from({ length: rackHeight + 1 }, (_, i) => (
        <Line key={`line-${i}`} points={[20, frameTop + i * uHeight, 124, frameTop + i * uHeight]} stroke="#ccc" strokeWidth={1} />
      ))}
      {Array.from({ length: rackHeight }, (_, i) => (
        <Text key={`label-${i}`} x={5} y={frameTop + i * uHeight + (uHeight / 2) - 6} text={String(rackHeight - i)} fontSize={9} fill="black" align="center" width={15} />
      ))}
      {adjustedData.length === 0 ? (
  <Text x={90} y={100} text="Veri Yok" fontSize={9} fill="black" align="center" />
) : isFullRack ? (
  <>
    <Rect 
      x={productXOffset} 
      y={frameTop} 
      width={productWidth} 
      height={innerHeight} 
      fill={(productColors[cabinet] && productColors[cabinet][0]) || 'lightblue'} // Dinamik renk
      stroke="black" 
      strokeWidth={1}
      onMouseEnter={(e) => handleMouseEnter(e, adjustedData[0])}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => handleProductClick(e, 0)} 
      listening={true}
    />
    <Text 
      x={productXOffset + 4} 
      y={frameTop + innerHeight / 2 - 20} 
      text={formatProductName(adjustedData[0]?.BrandModel, maxU)} 
      fontSize={9} 
      fill="black" 
      align="center" 
      width={104} 
    />
    <Text 
      x={productXOffset + 4} 
      y={frameTop + innerHeight / 2} 
      text={`**42U’dan yüksek ${maxU}U**`} 
      fontSize={9} 
      fill="black" 
      align="center" 
      width={104}
      bold={true}
    />
  </>
) : (
  adjustedData.sort((a, b) => b.Rack - a.Rack).map((item, index) => {
    const startU = item.Rack;
    const u = Math.min(item.U, rackHeight - (startU - 1));
    const faceValue = item.Face ? item.Face.toLowerCase() : '';
    const defaultColor = (faceValue === 'arka' || faceValue === 'back') ? 'orange' : 'lightblue';
    const color = (productColors[cabinet] && productColors[cabinet][index]) || defaultColor;
    const itemHeight = u * uHeight;
    const adjustedY = calculateProductY(item, index, adjustedData);

    return (
      <React.Fragment key={index}>
        <Rect 
          x={productXOffset} 
          y={adjustedY} 
          width={productWidth} 
          height={itemHeight} 
          fill={color} 
          stroke="black" 
          strokeWidth={1}
          onClick={(e) => handleProductClick(e, index)}
          onMouseEnter={(e) => handleMouseEnter(e, item)}
          onMouseLeave={handleMouseLeave}
          listening={true}
        />
        <Text 
          x={productXOffset} 
          y={adjustedY + (itemHeight / 2) - 6} 
          text={formatProductName(item.BrandModel, u)} 
          fontSize={9} 
          fill="black" 
          align="center" 
          width={productWidth} 
          listening={false}
        />
      </React.Fragment>
    );
  })
)}
      {tooltip && (
        <Group x={tooltip.x} y={tooltip.y}>
          <Rect width={120} height={60} fill="rgba(0, 0, 0, 0.8)" cornerRadius={5} />
          <Text text={`Owner: ${tooltip.owner}`} fontSize={10} fill="white" padding={5} width={112} />
          <Text text={`Serial: ${tooltip.serial}`} fontSize={12} fill="white" padding={5} y={20} width={112} />
        </Group>
      )}
    </Group>
  );
};

export default RackComponent;