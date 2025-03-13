import React from 'react';

const UploadComponent = ({ setFile, uploadFile, errors, t }) => {
  return (
    <div className="upload-component">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadFile}>{t.upload_button}</button>
      {errors && <div style={{ color: 'red' }}>{JSON.stringify(errors)}</div>}
    </div>
  );
};

export default UploadComponent;