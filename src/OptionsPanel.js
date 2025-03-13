import React from 'react';

const OptionsPanel = ({ gridSize, setGridSize, labelMargin, setLabelMargin, labelAlignment, setLabelAlignment, t }) => {
  return (
    <div className="options-container">
      <div className="option">
        <label htmlFor="gridSize">{t.app_snap_to_grid} </label>
        <select id="gridSize" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))}>
          <option value={0}>{t.app_no_grid}</option>
          <option value={10}>10x10</option>
          <option value={20}>20x20</option>
        </select>
      </div>
      <div className="option">
        <label htmlFor="labelMargin">{t.app_label_margin}: </label>
        <select id="labelMargin" value={labelMargin} onChange={(e) => setLabelMargin(parseInt(e.target.value))}>
          <option value={0}>0px ({t.app_label_margin_0})</option>
          <option value={5}>5px</option>
          <option value={10}>10px</option>
          <option value={15}>15px</option>
        </select>
      </div>
      <div className="option">
        <label htmlFor="labelAlignment">{t.app_label_alignment}: </label>
        <select id="labelAlignment" value={labelAlignment} onChange={(e) => setLabelAlignment(e.target.value)}>
          <option value="left">{t.app_left}</option>
          <option value="center">{t.app_center}</option>
          <option value="right">{t.app_right}</option>
        </select>
      </div>
    </div>
  );
};

export default OptionsPanel;