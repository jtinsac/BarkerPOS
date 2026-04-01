import React from 'react';

const PesoIcon = ({ size = 18, style = {} }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {/* Peso symbol ₱ - vertical line */}
      <line x1="6" y1="4" x2="6" y2="20" />
      {/* P shape - top curve */}
      <path d="M6 4h6a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6" />
      {/* First horizontal line */}
      <line x1="3" y1="8" x2="12" y2="8" />
      {/* Second horizontal line */}
      <line x1="3" y1="11" x2="12" y2="11" />
    </svg>
  );
};

export default PesoIcon;