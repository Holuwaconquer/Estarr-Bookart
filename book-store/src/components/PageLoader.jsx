import React from 'react';
import { HiBookOpen } from 'react-icons/hi';

const PageLoader = ({ label = 'Preparing your reading space' }) => (
  <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
    <div className="page-loader__glow page-loader__glow--one" />
    <div className="page-loader__glow page-loader__glow--two" />

    <div className="page-loader__content">
      <div className="page-loader__mark">
        <span className="page-loader__ring" />
        <HiBookOpen className="page-loader__icon" aria-hidden="true" />
      </div>
      <p className="page-loader__brand">Estarr Bookart</p>
      <p className="page-loader__label">{label}</p>
      <div className="page-loader__track" aria-hidden="true">
        <span className="page-loader__bar" />
      </div>
    </div>
  </div>
);

export default PageLoader;
