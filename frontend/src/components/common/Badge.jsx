import React from 'react';
import { getCategoryInfo } from '../../utils/aqiStandards';

export default function Badge({ category, size = 'md', className = '', showRange = false }) {
  const info = getCategoryInfo(category);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        backgroundColor: info.bgLight,
        color: info.textColor,
        borderColor: info.borderColor,
      }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: info.color }}
      />
      <span>{info.name}</span>
      {showRange && <span className="opacity-75 text-[10px]">({info.range})</span>}
    </span>
  );
}

