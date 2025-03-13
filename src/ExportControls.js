import React from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

const ExportControls = ({ stageRef, zoomLevel, setZoomLevel, cabinets, positions, productColors, labelAlignment, t }) => {
  const exportToPNG = () => {
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'rack-diagram.png';
    link.click();
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgData = stageRef.current.toDataURL({ pixelRatio: 2 });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    pdf.save('rack-diagram.pdf');
  };

  const exportToPPTX = () => {
    const pptx = new PptxGenJS();
    const scaleFactor = 0.01;
    const scaleDown = 0.6; // %40 küçültme, PPTX için
    const rackHeight = 42;
    const frameTop = 24 * scaleDown; // 24 * 0.6 = 14.4
    const frameBottom = 600 * scaleDown; // 600 * 0.6 = 360
    const innerHeight = frameBottom - frameTop; // 360 - 14.4 = 345.6
    const uHeight = innerHeight / rackHeight; // 345.6 / 42 ≈ 8.229
    const cabinetWidth = 180 * scaleDown; // 180 * 0.6 = 108
    const productWidth = 140 * scaleDown; // 140 * 0.6 = 84
    const extraSpaceX = -10; // Negatif boşluk, kabinleri yakınlaştırır

    const cabinetEntries = Object.entries(cabinets);
    const cabinetsPerSlide = 10;
    const slidesCount = Math.ceil(cabinetEntries.length / cabinetsPerSlide);

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

    for (let slideIndex = 0; slideIndex < slidesCount; slideIndex++) {
      const slide = pptx.addSlide();
      const startIdx = slideIndex * cabinetsPerSlide;
      const endIdx = Math.min(startIdx + cabinetsPerSlide, cabinetEntries.length);
      const slideCabinets = cabinetEntries.slice(startIdx, endIdx);

      slideCabinets.forEach(([cabinet, data], idx) => {
        const col = idx % cabinetsPerSlide;
        const xPosition = col * (cabinetWidth + extraSpaceX); // Bitişik kabinler için negatif boşluk
        const position = positions[cabinet] || { x: xPosition, y: 0 }; // y=0, çünkü her slayt sıfırlı

        const adjustedData = Array.isArray(data) && data.length > 0
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

        slide.addShape(pptx.ShapeType.rect, {
          x: position.x * scaleFactor,
          y: frameTop * scaleFactor,
          w: cabinetWidth * scaleFactor,
          h: innerHeight * scaleFactor,
          line: { color: '000000', width: 1 },
          fill: { type: 'none' }
        });

        const validAlign = typeof labelAlignment === 'string' ? labelAlignment.toLowerCase() : 'center';
        slide.addText(cabinet, {
          x: position.x * scaleFactor,
          y: (6 - labelMargin) * scaleFactor,
          w: cabinetWidth * scaleFactor,
          fontSize: 14,
          align: validAlign,
          color: '000000'
        });

        adjustedData.sort((a, b) => b.Rack - a.Rack);
        let previousEndU = null;
        const maxU = adjustedData.length > 0 ? Math.max(...adjustedData.map(item => item.Rack + item.U - 1)) : rackHeight;
        const isFullRack = maxU > rackHeight;

        if (isFullRack) {
          const oversizedItem = adjustedData[0];
          const color = productColors[cabinet]?.[0] || 'FFFF00';
          slide.addShape(pptx.ShapeType.rect, {
            x: (position.x + (cabinetWidth - productWidth) / 2) * scaleFactor,
            y: frameTop * scaleFactor,
            w: productWidth * scaleFactor,
            h: innerHeight * scaleFactor,
            fill: { color: color.replace('#', '') },
            line: { color: '000000', width: 1 }
          });

          slide.addText(oversizedItem.BrandModel, {
            x: (position.x + (cabinetWidth - (130 * scaleDown)) / 2) * scaleFactor,
            y: (frameTop + innerHeight / 2 - 20) * scaleFactor,
            w: (130 * scaleDown) * scaleFactor,
            fontSize: 7,
            align: 'center',
            color: '000000'
          });

          slide.addText(`**42U’dan yüksek ${maxU}U**`, {
            x: (position.x + (cabinetWidth - (130 * scaleDown)) / 2) * scaleFactor,
            y: (frameTop + innerHeight / 2) * scaleFactor,
            w: (130 * scaleDown) * scaleFactor,
            fontSize: 7,
            align: 'center',
            bold: true,
            color: '000000'
          });
        } else {
          adjustedData.forEach((item, index) => {
            const startU = item.Rack;
            const u = Math.min(item.U, rackHeight - (startU - 1));
            const faceValue = item.Face ? item.Face.toLowerCase() : '';
            const defaultColor = (faceValue === 'arka' || faceValue === 'back') ? 'FFA500' : 'ADD8E6';
            const color = productColors[cabinet]?.[index] || defaultColor;

            const itemHeight = u * uHeight;
            const adjustedY = calculateProductY(item, index, adjustedData);

            slide.addShape(pptx.ShapeType.rect, {
              x: (position.x + (cabinetWidth - productWidth) / 2) * scaleFactor,
              y: adjustedY * scaleFactor,
              w: productWidth * scaleFactor,
              h: itemHeight * scaleFactor,
              fill: { color: color.replace('#', '') },
              line: { color: '000000', width: 1 }
            });

            slide.addText(item.BrandModel, {
              x: (position.x + (cabinetWidth - (140 * scaleDown)) / 2) * scaleFactor,
              y: (adjustedY + itemHeight / 2 - 6) * scaleFactor,
              w: (140 * scaleDown) * scaleFactor,
              fontSize: 7,
              align: 'center',
              color: '000000'
            });
          });
        }
      });
    }

    pptx.writeFile({ fileName: 'rack-diagram.pptx' });
  };

  return (
    <div className="button-container">
      <Link to="/">
        <button className="help-button">{t.app_help_button}</button>
      </Link>
      <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}>{t.app_zoom_in}</button>
      <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}>{t.app_zoom_out}</button>
      <button onClick={exportToPNG}>{t.app_export_png}</button>
      <button onClick={exportToPPTX}>{t.app_export_pdf.replace('PDF', 'PPTX')}</button>
      <button onClick={exportToPDF}>{t.app_export_pdf}</button>
      <Link to="/">
        <button>{t.back_to_home}</button>
      </Link>
    </div>
  );
};

export default ExportControls;