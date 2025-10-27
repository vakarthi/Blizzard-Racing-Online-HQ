import React from 'react';
import type { AnalysisResult } from '../types';
import { MetricCard } from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '../hooks/useAuth';

interface ComparisonChartProps {
    results: AnalysisResult[];
}

const rgbToHex = (rgb: string) => {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return "#" + result.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
};

const ComparisonChart: React.FC<ComparisonChartProps> = ({ results }) => {
    const { theme } = useTheme();
    const chartData = [
        { name: 'Drag Coeff.', [results[0].fileName]: results[0].dragCoefficient, [results[1].fileName]: results[1].dragCoefficient },
        { name: 'Downforce Coeff.', [results[0].fileName]: Math.abs(results[0].liftCoefficient), [results[1].fileName]: Math.abs(results[1].liftCoefficient) },
        { name: 'L/D Ratio', [results[0].fileName]: results[0].liftToDragRatio, [results[1].fileName]: results[1].liftToDragRatio },
    ];

    const colors = {
      grid: rgbToHex(theme.colors['--color-border-color']),
      text: rgbToHex(theme.colors['--color-text-secondary']),
      tooltipBg: rgbToHex(theme.colors['--color-background-primary']),
      bar1: rgbToHex(theme.colors['--color-primary']),
      bar2: rgbToHex(theme.colors['--color-danger']),
  }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                    <Legend wrapperStyle={{ color: theme.colors['--color-text-primary'], paddingTop: '10px' }} />
                    <Bar dataKey={results[0].fileName} fill={colors.bar1} />
                    <Bar dataKey={results[1].fileName} fill={colors.bar2} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


interface ComparisonPageProps {
  results: AnalysisResult[];
  onBack: () => void;
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({ results, onBack }) => {
    if (results.length !== 2) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary">Comparison Error</h1>
                <p className="text-text-secondary">Please select exactly two cars to compare.</p>
                <button onClick={onBack} className="mt-4 bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded">Back to Testing</button>
            </div>
        );
    }

    const [car1, car2] = results;

    const getHighlightClass = (val1: number, val2: number, lowerIsBetter: boolean): [string, string] => {
        if (Math.abs(val1 - val2) < 0.0001) return ['border-border-color', 'border-border-color']; // Treat as equal
        if (lowerIsBetter) {
            return val1 < val2 ? ['border-success', 'border-danger'] : ['border-danger', 'border-success'];
        }
        return val1 > val2 ? ['border-success', 'border-danger'] : ['border-danger', 'border-success'];
    };
    
    const [cdClass1, cdClass2] = getHighlightClass(car1.dragCoefficient, car2.dragCoefficient, true);
    const [clClass1, clClass2] = getHighlightClass(Math.abs(car1.liftCoefficient), Math.abs(car2.liftCoefficient), true);
    const [ldClass1, ldClass2] = getHighlightClass(car1.liftToDragRatio, car2.liftToDragRatio, false);


    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Aero Comparison</h1>
                <button onClick={onBack} className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    <span>Back to Testing</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Car 1 */}
                <div className="bg-background-secondary rounded-lg p-6 border border-border-color space-y-4">
                    <h2 className="text-2xl font-bold text-primary truncate" title={car1.fileName}>{car1.fileName}</h2>
                    <div className={`p-2 rounded-lg border-l-4 ${cdClass1} bg-background-primary/20 transition-all duration-300`}><MetricCard title="Drag Coefficient (Cd)" value={car1.dragCoefficient.toFixed(4)} tooltip="Lower is better." /></div>
                    <div className={`p-2 rounded-lg border-l-4 ${clClass1} bg-background-primary/20 transition-all duration-300`}><MetricCard title="Downforce (Cl)" value={car1.liftCoefficient.toFixed(4)} tooltip="Less downforce (closer to zero) is better for top speed." /></div>
                    <div className={`p-2 rounded-lg border-l-4 ${ldClass1} bg-background-primary/20 transition-all duration-300`}><MetricCard title="L/D Ratio" value={car1.liftToDragRatio.toFixed(3)} tooltip="Higher is better for overall efficiency." /></div>
                </div>
                {/* Car 2 */}
                <div className="bg-background-secondary rounded-lg p-6 border border-border-color space-y-4">
                     <h2 className="text-2xl font-bold text-danger truncate" title={car2.fileName}>{car2.fileName}</h2>
                    <div className={`p-2 rounded-lg border-l-4 ${cdClass2} bg-background-primary/20 transition-all duration-300`}><MetricCard title="Drag Coefficient (Cd)" value={car2.dragCoefficient.toFixed(4)} tooltip="Lower is better." /></div>
                    <div className={`p-2 rounded-lg border-l-4 ${clClass2} bg-background-primary/20 transition-all duration-300`}><MetricCard title="Downforce (Cl)" value={car2.liftCoefficient.toFixed(4)} tooltip="Less downforce (closer to zero) is better for top speed." /></div>
                    <div className={`p-2 rounded-lg border-l-4 ${ldClass2} bg-background-primary/20 transition-all duration-300`}><MetricCard title="L/D Ratio" value={car2.liftToDragRatio.toFixed(3)} tooltip="Higher is better for overall efficiency." /></div>
                </div>
            </div>
            
            <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-text-primary">Performance Comparison Chart</h3>
                <ComparisonChart results={results} />
            </div>

             <div className="text-center text-text-secondary text-sm flex items-center justify-center space-x-6">
                <p><span className="w-3 h-3 inline-block rounded-sm bg-success/80 border border-success mr-2"></span>Indicates better performance</p>
                <p><span className="w-3 h-3 inline-block rounded-sm bg-danger/80 border border-danger mr-2"></span>Indicates worse performance</p>
            </div>
        </div>
    );
};

export default ComparisonPage;