import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UploadComponent from './UploadComponent';
import RackComponent from './RackComponent';
import './App.css';
import { Stage, Layer } from 'react-konva';
import { jsPDF } from 'jspdf';

const MainApp = () => {
  const [cabinets, setCabinets] = useState({});
  const [positions, setPositions] = useState({});
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [gridSize, setGridSize] = useState(10);
  const [labelMargin, setLabelMargin] = useState(0);
  const [labelAlignment, setLabelAlignment] = useState('center');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWarning, setShowWarning] = useState(false); // Uyarı için state
  const stageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const uploadFile = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:3001/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.errors) {
        setErrors(data.errors);
      } else {
        const cabinetNames = Object.keys(data);
        if (cabinetNames.length > 20) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 2000); // 2 saniye sonra kaybolur
        }
        // Maksimum 20 kabin ile sınırlı
        const limitedCabinets = Object.fromEntries(cabinetNames.slice(0, 20).map(name => [name, data[name]]));
        setCabinets(limitedCabinets);
        setErrors(null);

        const extraSpaceX = 180; // X ekseninde kabinler arası boşluk
        const extraSpaceY = 600; // Y ekseninde satır arası boşluk (rack yüksekliği kadar)
        const initialPositions = Object.keys(limitedCabinets).reduce((acc, cabinet, i) => {
          const row = Math.floor(i / 10); // Her 10 kabinde yeni satır
          const col = i % 10; // Satırdaki pozisyon
          const xPosition = col * extraSpaceX;
          const yPosition = row * extraSpaceY;
          acc[cabinet] = { x: xPosition, y: yPosition };
          return acc;
        }, {});
        setPositions(initialPositions);
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setErrors({ upload: 'Dosya yüklenirken bir hata oluştu: ' + error.message });
    }
  };

  const handleDragMove = (e, gridSize) => {
    const newX = gridSize > 0 ? Math.round(e.target.x() / gridSize) * gridSize : e.target.x();
    const newY = gridSize > 0 ? Math.round(e.target.y() / gridSize) * gridSize : e.target.y();
    e.target.x(newX);
    e.target.y(newY);
  };

  const handleDragEnd = (cabinet, e) => {
    setPositions(prev => ({
      ...prev,
      [cabinet]: { x: e.target.x(), y: e.target.y() }
    }));
  };

  const handleGridChange = (e) => setGridSize(parseInt(e.target.value));
  const handleMarginChange = (e) => setLabelMargin(parseInt(e.target.value));
  const handleAlignmentChange = (e) => setLabelAlignment(e.target.value);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

  const exportToPNG = () => {
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'rack-diagram.png';
    link.click();
  };

  const exportToSVG = () => {
    const svgData = stageRef.current.toDataURL({ mimeType: 'image/svg+xml', pixelRatio: 2 });
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rack-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="app-container">
      <div className="app-content">
        <h1>Rack Diagram Web</h1>
        <UploadComponent setFile={setFile} uploadFile={uploadFile} errors={errors} />
        <div className="options-container">
          <div className="option">
            <label htmlFor="gridSize">Snap-to-Grid: </label>
            <select id="gridSize" value={gridSize} onChange={handleGridChange}>
              <option value={0}>Izgara Yok</option>
              <option value={10}>10x10</option>
              <option value={20}>20x20</option>
            </select>
          </div>
          <div className="option">
            <label htmlFor="labelMargin">Etiket Boşluğu: </label>
            <select id="labelMargin" value={labelMargin} onChange={handleMarginChange}>
              <option value={0}>0px (Bitişik)</option>
              <option value={5}>5px</option>
              <option value={10}>10px</option>
              <option value={15}>15px</option>
            </select>
          </div>
          <div className="option">
            <label htmlFor="labelAlignment">Etiket Hizalama: </label>
            <select id="labelAlignment" value={labelAlignment} onChange={handleAlignmentChange}>
              <option value="left">Sol</option>
              <option value="center">Orta</option>
              <option value="right">Sağ</option>
            </select>
          </div>
        </div>
        <div className="button-container">
          <Link to="/">
            <button className="help-button">Nasıl Kullanılır?</button>
          </Link>
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
          <button onClick={exportToPNG}>PNG İndir</button>
          <button onClick={exportToSVG}>SVG İndir</button>
          <button onClick={exportToPDF}>PDF İndir</button>
        </div>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
          ref={stageRef}
        >
          <Layer>
            {Object.entries(cabinets).map(([cabinet, data]) => (
              <RackComponent
                key={cabinet}
                cabinet={cabinet}
                data={data}
                position={positions[cabinet]}
                handleDragMove={(e) => handleDragMove(e, gridSize)}
                handleDragEnd={handleDragEnd}
                gridSize={gridSize}
                labelMargin={labelMargin}
                labelAlignment={labelAlignment}
              />
            ))}
          </Layer>
        </Stage>
        {showWarning && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '5px',
            zIndex: 1000
          }}>
            20 kabinden fazlası çizilmez
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;