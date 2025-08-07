'use client';

import { useEffect, useRef } from 'react';

export function DashboardCharts() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Create a simple chart using Canvas API
        // In a real app, you'd use Chart.js or similar
        const canvas = chartRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw chart background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Draw chart title
        ctx.fillStyle = '#1e293b';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('Revenue Overview', 20, 30);

        // Draw sample data points
        const data = [30, 45, 35, 60, 50, 75, 65];
        const maxValue = Math.max(...data);
        const barWidth = (width - 60) / data.length;
        const barHeight = height - 80;

        data.forEach((value, index) => {
          const x = 30 + index * barWidth;
          const barHeightPx = (value / maxValue) * barHeight;
          const y = height - 50 - barHeightPx;

          // Draw bar
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(x, y, barWidth - 10, barHeightPx);

          // Draw value
          ctx.fillStyle = '#64748b';
          ctx.font = '12px Inter, sans-serif';
          ctx.fillText(`$${value}k`, x, height - 20);
        });
      }
    }
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Revenue Overview</h3>
        <p>Monthly revenue and deals closed over time</p>
      </div>
      <div className="card-content">
        <canvas ref={chartRef} width={400} height={200}></canvas>
      </div>
    </div>
  );
} 