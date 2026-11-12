import React from 'react';
import { PlayerColor } from '../../logic/ludoEngine';

/**
 * 100% Vector SVG Teardrop Pin (Goti) matching reference design
 */
export const TeardropPinSVG: React.FC<{ color: PlayerColor; className?: string }> = ({
  color,
  className = 'w-full h-full',
}) => {
  const configs: Record<PlayerColor, { grad: [string, string]; stroke: string }> = {
    blue: { grad: ['#3db4ff', '#0072c4'], stroke: '#005999' },
    red: { grad: ['#ff4d53', '#c40c14'], stroke: '#8c0006' },
    green: { grad: ['#28d672', '#00853a'], stroke: '#005927' },
    yellow: { grad: ['#fff16b', '#e6b800'], stroke: '#ad7e00' },
  };

  const conf = configs[color] || configs.blue;

  return (
    <svg viewBox="0 0 44 54" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* White 3D Goti Body Gradient */}
        <linearGradient id={`hudWhitePinGrad_${color}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f2f4f8" />
          <stop offset="85%" stopColor="#dbe0e8" />
          <stop offset="100%" stopColor="#bcc5d1" />
        </linearGradient>

        <radialGradient id={`hudPinGrad_${color}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={conf.grad[0]} />
          <stop offset="100%" stopColor={conf.grad[1]} />
        </radialGradient>
        <filter id={`hudPinShadow_${color}`} x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter={`url(#hudPinShadow_${color})`}>
        {/* White 3D Teardrop Body */}
        <path
          d="M22,4 C12.5,4 5,11.5 5,21 C5,30.5 15,42.5 22,51 C29,42.5 39,30.5 39,21 C39,11.5 31.5,4 22,4 Z"
          fill={`url(#hudWhitePinGrad_${color})`}
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Clean Inner Colored Circle */}
        <circle
          cx="22"
          cy="20.5"
          r="12.5"
          fill={`url(#hudPinGrad_${color})`}
          stroke={conf.stroke}
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};
