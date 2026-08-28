import React from 'react';
import { getEan13BitPattern, getGenericBarPattern } from '../utils/barcode';

interface BarcodeViewProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
  barColor?: string;
  bgColor?: string;
  textClassName?: string;
}

export const BarcodeView: React.FC<BarcodeViewProps> = ({
  value,
  width = 160,
  height = 55,
  showText = true,
  className = '',
  barColor = '#000000',
  bgColor = '#ffffff',
  textClassName = 'text-[11px] font-mono tracking-widest font-bold text-slate-800'
}) => {
  const cleanValue = value ? String(value).trim() : '0000000000000';
  const isEan13 = /^\d{13}$/.test(cleanValue);
  const bitPattern = isEan13 ? getEan13BitPattern(cleanValue) : getGenericBarPattern(cleanValue);
  const pattern = bitPattern || getGenericBarPattern(cleanValue);

  const barWidth = width / pattern.length;

  return (
    <div className={`inline-flex flex-col items-center justify-center p-1.5 rounded bg-white select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} fill={bgColor} />
        {pattern.split('').map((bit, idx) => {
          if (bit === '1') {
            const x = idx * barWidth;
            // For EAN-13, make guard bars slightly longer if desired
            return (
              <rect
                key={idx}
                x={x}
                y={0}
                width={Math.max(barWidth, 1)}
                height={height}
                fill={barColor}
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <div className={`mt-1 text-center font-mono ${textClassName}`}>
          {isEan13
            ? `${cleanValue.slice(0, 1)} ${cleanValue.slice(1, 7)} ${cleanValue.slice(7, 13)}`
            : cleanValue}
        </div>
      )}
    </div>
  );
};
