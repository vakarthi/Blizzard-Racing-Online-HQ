import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { MetricCard } from './MetricCard';
import { Suggestions } from './Suggestions';
import { ResultsChart } from './ResultsChart';
// FIX: Add file extension to import to resolve module resolution issue.
import { ScrutineeringDisplay } from './ScrutineeringDisplay.tsx';
import { generatePdfReport } from '../services/pdfService';


interface AnalysisDisplayProps {
  fileName: string;
  analysisState: 'analyzing' | 'complete';
  result: AnalysisResult | null;
  onReset?: () => void;
}

const analysisSteps = [
    "Initializing virtual wind tunnel...",
    "Loading vehicle geometry...",
    "Meshing aerodynamic surfaces...",
    "Running Computational Fluid Dynamics (CFD) simulation...",
    "Analyzing surface pressure and shear stress...",
    "Calculating aerodynamic coefficients...",
    "Generating scrutineering report...",
    "Finalizing results...",
];

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ fileName, analysisState, result, onReset }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (analysisState === 'analyzing') {
            setCurrentStep(0);
            const interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < analysisSteps.length - 1) {
                        return prev + 1;
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, 550); // Adjusted timing for more steps
            return () => clearInterval(interval);
        }
    }, [analysisState]);

    const handleDownload = () => {
        if (result) {
            generatePdfReport(result);
        }
    };


    if (analysisState === 'analyzing') {
        return (
            <div className="text-center bg-background-secondary p-8 rounded-lg border border-border-color shadow-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Analyzing <span className="text-accent">{fileName}</span></h2>
                <div className="w-full bg-background-tertiary rounded-full h-2.5 my-6 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(currentStep + 1) / analysisSteps.length * 100}%` }}></div>
                </div>
                <p className="text-text-primary text-lg transition-opacity duration-500">{analysisSteps[currentStep]}</p>
            </div>
        );
    }
    
    if (!result) return null;

    return (
        <div className="space-y-8 animate-fade-in" id="analysis-report">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-text-primary">Analysis Details: <span className="text-accent">{fileName}</span></h2>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleDownload}
                        className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2 print-hide"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span>Download PDF</span>
                    </button>
                    {onReset && (
                        <button 
                            onClick={onReset}
                            className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2 print-hide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                            <span>Analyze New Car</span>
                        </button>
                    )}
                </div>
            </div>
            
            <ScrutineeringDisplay report={result.scrutineeringReport} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Drag Coefficient (Cd)" value={result.dragCoefficient.toFixed(4)} tooltip="A lower value indicates less air resistance." />
                <MetricCard title="Downforce (Cl)" value={result.liftCoefficient.toFixed(4)} tooltip="A less negative value reduces drag, which is good for top speed." />
                <MetricCard title="L/D Ratio" value={result.liftToDragRatio.toFixed(3)} tooltip="Lift-to-Drag Ratio. A key measure of aerodynamic efficiency. Higher is better." />
                 <MetricCard title="Drag Force" value={`${result.dragForceNewtons.toFixed(2)} N`} tooltip="The total drag force at 80 km/h." />
            </div>

            <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-text-primary">Performance Metrics</h3>
                <ResultsChart data={result} />
            </div>

            <Suggestions suggestions={result.suggestions} />
        </div>
    );
};