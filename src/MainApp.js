import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import UploadSection from './UploadSection';
import OptionsPanel from './OptionsPanel';
import ExportControls from './ExportControls';
import CanvasArea from './CanvasArea';
import ColorPicker from './ColorPicker';
import { useLanguage } from './context/LanguageContext';

const MainApp = () => {
  const { t } = useLanguage();
  const [cabinets, setCabinets] = useState({});
  const [positions, setPositions] = useState({});
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [gridSize, setGridSize] = useState(10);
  const [labelMargin, setLabelMargin] = useState(0);
  const [labelAlignment, setLabelAlignment] = useState('center');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productColors, setProductColors] = useState({});
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleColorChange = (color) => {
    if (selectedProduct) {
      const { cabinet, index } = selectedProduct;
      setProductColors(prev => {
        const updatedColors = { ...prev };
        if (!updatedColors[cabinet]) {
          updatedColors[cabinet] = {};
        }
        updatedColors[cabinet][index] = color;
        return updatedColors;
      });
      setSelectedProduct(null);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <UploadSection
          file={file}
          setFile={setFile}
          uploadFile={setCabinets}
          errors={errors}
          setErrors={setErrors}
          setPositions={setPositions}
          setShowWarning={setShowWarning}
          t={t}
        />
        <OptionsPanel
          gridSize={gridSize}
          setGridSize={setGridSize}
          labelMargin={labelMargin}
          setLabelMargin={setLabelMargin}
          labelAlignment={labelAlignment}
          setLabelAlignment={setLabelAlignment}
          t={t}
        />
        <ExportControls
          stageRef={stageRef}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          cabinets={cabinets}
          positions={positions}
          productColors={productColors}
          labelAlignment={labelAlignment}
          t={t}
        />
        {selectedProduct && (
          <ColorPicker
            position={colorPickerPosition}
            onColorChange={handleColorChange}
          />
        )}
        <CanvasArea
          cabinets={cabinets}
          positions={positions}
          setPositions={setPositions}
          gridSize={gridSize}
          labelMargin={labelMargin}
          labelAlignment={labelAlignment}
          zoomLevel={zoomLevel}
          productColors={productColors}
          onProductSelect={(cabinet, index, mouseX, mouseY) => {
            setSelectedProduct({ cabinet, index });
            setColorPickerPosition({ x: mouseX, y: mouseY });
          }}
          stageRef={stageRef}
        />
        {showWarning && (
          <div className="warning-popup">
            {t.max_cabinets_warning}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;