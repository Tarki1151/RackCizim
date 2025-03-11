import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UploadComponent from './UploadComponent';
import RackComponent from './RackComponent';
import './App.css';
import { Stage, Layer } from 'react-konva';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

const MainApp = () => {
  const { t } = useTranslation();
  const [cabinets, setCabinets] = useState({});
  const [positions, setPositions] = useState({});
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [gridSize, setGridSize] = useState(10);
  const [labelMargin, setLabelMargin] = useState(0);
  const [labelAlignment, setLabelAlignment] = useState('center');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
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
          setTimeout(() => setShowWarning(false), 2000);
        }
        const limitedCabinets = Object.fromEntries(cabinetNames.slice(0, 20).map(name => [name, data[name]]));
        setCabinets(limitedCabinets);
        setErrors(null);

        const extraSpaceX = 180;
        const extraSpaceY = 600;
        const initialPositions = Object.keys(limitedCabinets).reduce((acc, cabinet, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
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

  const cabinetCount = Object.keys(cabinets).length;
  const rows = Math.ceil(cabinetCount / 10);
  const canvasHeight = rows * 600 + 100;

  return (
    <div className="app-container">
      <div className="app-content">
        <h1>Rack Diagram Web</h1>
        <UploadComponent setFile={setFile} uploadFile={uploadFile} errors={errors} />
        <div className="options-container">
          <div className="option">
            <label htmlFor="gridSize">Snap-to-Grid: </label>
            <select id="gridSize" value={gridSize} onChange={handleGridChange}>
              <option value={0}>{t('no_grid')}</option>
              <option value={10}>10x10</option>
              <option value={20}>20x20</option>
            </select>
          </div>
          <div className="option">
            <label htmlFor="labelMargin">{t('label_margin')}: </label>
            <select id="labelMargin" value={labelMargin} onChange={handleMarginChange}>
              <option value={0}>0px ({t('adjacent')})</option>
              <option value={5}>5px</option>
              <option value={10}>10px</option>
              <option value={15}>15px</option>
            </select>
          </div>
          <div className="option">
            <label htmlFor="labelAlignment">{t('label_alignment')}: </label>
            <select id="labelAlignment" value={labelAlignment} onChange={handleAlignmentChange}>
              <option value="left">{t('left')}</option>
              <option value="center">{t('center')}</option>
              <option value="right">{t('right')}</option>
            </select>
          </div>
        </div>
        <div className="button-container">
          <Link to="/">
            <button className="help-button">{t('how_to_use')}</button>
          </Link>
          <button onClick={handleZoomIn}>{t('zoom_in')}</button>
          <button onClick={handleZoomOut}>{t('zoom_out')}</button>
          <button onClick={exportToPNG}>{t('download_png')}</button>
          <button onClick={exportToSVG}>{t('download_svg')}</button>
          <button onClick={exportToPDF}>{t('download_pdf')}</button>
          <Link to="/">
            <button>{t('back_to_home')}</button>
          </Link>
        </div>
        <div className="canvas-container" style={{ overflow: 'auto', maxHeight: '100vh' }}>
          <Stage
            width={window.innerWidth}
            height={canvasHeight}
            scaleX={zoomLevel}
            scaleY={zoomLevel}
            ref={stageRef}
          >
            <Layer>
              {Object.entries(cabinets).map(([cabinet, data]) => {
                const position = positions[cabinet] || { x: 0, y: 0 };
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
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
        {showWarning && (
          <div className="warning-popup">
            {t('max_cabinets_warning')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;