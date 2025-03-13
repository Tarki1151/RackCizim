import React from 'react';
import UploadComponent from './UploadComponent';

const UploadSection = ({ file, setFile, uploadFile, errors, setErrors, setPositions, setShowWarning, t }) => {
  const handleUpload = async () => {
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
        uploadFile(limitedCabinets);
        setErrors(null);

        const cabinetWidth = 144; // Sabit küçültülmüş genişlik
        const cabinetHeight = 480; // Sabit küçültülmüş yükseklik
        const extraSpaceX = 0; // Kabin genişliğine yakın negatif boşluk, üst üste binmeyi önler
        const extraSpaceY = 100; // Dikeyde ek boşluk, satırları ayırır

        const initialPositions = Object.keys(limitedCabinets).reduce((acc, cabinet, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const xPosition = col * (cabinetWidth + extraSpaceX);
          const yPosition = row * (cabinetHeight + extraSpaceY);
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

  return (
    <div className="header-container">
      <h1 className="app-title">{t.app_title}</h1>
      <UploadComponent setFile={setFile} uploadFile={handleUpload} errors={errors} t={t} />
    </div>
  );
};

export default UploadSection;