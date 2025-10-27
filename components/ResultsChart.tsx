import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import type { AnalysisResult } from '../types';
import { useTheme } from '../hooks/useAuth';

interface ResultsChartProps {
  data: AnalysisResult;
}

const rgbToHex = (rgb: string) => {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return "#" + result.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
};

export const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const chartData = [
    {
      name: 'Aerodynamic Forces',
      Drag: data.dragCoefficient,
      Downforce: Math.abs(data.liftCoefficient),
    },
  ];

  const colors = {
      grid: rgbToHex(theme.colors['--color-border-color']),
      text: rgbToHex(theme.colors['--color-text-secondary']),
      tooltipBg: rgbToHex(theme.colors['--color-background-primary']),
      bar1: rgbToHex(theme.colors['--color-danger']),
      bar2: rgbToHex(theme.colors['--color-accent']),
  }

  return (
    <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
            <BarChart
            data={chartData}
            margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="name" stroke={colors.text} />
            <YAxis stroke={colors.text}>
                 <Label value="Coefficient Value" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: colors.text }} />
            </YAxis>
            <Tooltip
                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.grid}`, borderRadius: '0.5rem' }}
                labelStyle={{ color: theme.colors['--color-text-primary'] }}
                itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ color: theme.colors['--color-text-primary'] }} />
            <Bar dataKey="Drag" fill={colors.bar1} name="Drag (Higher is worse)" />
            <Bar dataKey="Downforce" fill={colors.bar2} name="Downforce (Balance is key)" />
            </BarChart>
      </ResponsiveContainer>
    </div>
  );
};