import React from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css';
import { useLanguage } from './context/LanguageContext';

const WelcomePage = () => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <div className="welcome-container">
      <button onClick={toggleLanguage} className="language-button-top">
        {language === 'tr' ? 'Switch to English' : 'Türkçe’ye Geç'}
      </button>
      <img src="/logo.png" alt="Şirket Logosu" className="company-logo" />
      <div className="content-container">
        <h1>{t.welcome_title}</h1>
        <p>{t.welcome_description}</p>
        <h2>{t.welcome_how_to_use}</h2>
        <ol>
          <li>
            <strong>{t.welcome_step_1}</strong>{' '}
            <a href="/templates/input_template.xlsx" download>{t.welcome_download_template}</a>
          </li>
          <li>
            <strong>{t.welcome_step_2}</strong>
            <ul>
              <li><strong>Rack:</strong> {t.welcome_step_2_rack}</li>
              <li><strong>U:</strong> {t.welcome_step_2_u}</li>
              <li><strong>BrandModel:</strong> {t.welcome_step_2_brandmodel}</li>
              <li><strong>Face:</strong> {t.welcome_step_2_face}</li>
              <li><strong>Owner:</strong> {t.welcome_step_2_owner}</li>
              <li><strong>Serial:</strong> {t.welcome_step_2_serial}</li>
            </ul>
            <p><em>{t.welcome_step_2_note}</em></p>
          </li>
          <li><strong>{t.welcome_step_3}</strong></li>
          <li><strong>{t.welcome_step_4}</strong></li>
          <li><strong>{t.welcome_step_5}</strong></li>
        </ol>
        <h2>{t.welcome_tips}</h2>
        <ul>
          <li>{t.welcome_tip_1}</li>
          <li>{t.welcome_tip_2}</li>
          <li>{t.welcome_tip_3}</li>
        </ul>
        <Link to="/app">
          <button className="start-button">{t.welcome_start_button}</button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;