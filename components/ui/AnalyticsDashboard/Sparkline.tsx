'use client';

import { EventTrendPoint } from '@/types/analytics';

interface SparklineProps {
  data: EventTrendPoint[];
  color?: string;
}

export function Sparkline({ data, color = '#34d399' }: SparklineProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-16 w-full items-center justify-center text-xs text-zinc-500">
        No data
      </div>
    );
  }

  const width = 240;
  const height = 64;
  const values = data.map((point) => point.count);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((point, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * width;
    const y = height - ((point.count - min) / range) * height;
    return `${x},${y}`;
  });

  const areaPath = `M0,${height} L${points.join(' ')} L${width},${height} Z`;
  const linePath = `M${points.join(' L')}`;

  return (
    <svg
      role="img"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      aria-hidden
    >
      <path d={areaPath} fill={`${color}33`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
