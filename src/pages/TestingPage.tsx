import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FileUpload } from '../components/FileUpload';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import type { AnalysisResult } from '../types';
import { runAnalysis } from '../services/simulationService';
import { historyService } from '../services/historyService';
import { useAuth } from '../hooks/useAuth';

interface TestingPageProps {
  onCompare: (results: AnalysisResult[]) => void;
  setAnalysisContext: (result: AnalysisResult | null) => void;
}

const BestCarDisplay: React.FC<{ bestCar: AnalysisResult, onCompare: () => void }> = ({ bestCar, onCompare }) => (
    <div className="bg-warning/10 border-2 border-warning/80 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-warning flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
                <h3 className="font-bold text-lg text-warning/90">Top Performing Eligible Design</h3>
                <p className="text-sm text-warning/80 truncate" title={bestCar.fileName}>{bestCar.fileName} - <span className="font-semibold">L/D Ratio: {bestCar.liftToDragRatio.toFixed(3)}</span></p>
            </div>
        </div>
        <button onClick={onCompare} className="bg-warning hover:bg-yellow-500 text-yellow-900 font-bold text-sm py-2 px-3 rounded-lg transition-colors w-full sm:w-auto flex-shrink-0">
            Compare to Best
        </button>
    </div>
);


const TestingPage: React.FC<TestingPageProps> = ({ onCompare, setAnalysisContext }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [analysisState, setAnalysisState] = useState<'idle' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  
  useEffect(() => {
    if (user) {
        setHistory(historyService.getHistory(user.email));
    }
  }, [user]);

  const bestCar = useMemo(() => {
    const eligibleHistory = history.filter(h => h.scrutineeringReport.isEligibleForFastestCar);
    if (eligibleHistory.length === 0) return null;

    return eligibleHistory.reduce((best, current) => {
        if (current.liftToDragRatio > best.liftToDragRatio) {
            return current;
        }
        if (current.liftToDragRatio === best.liftToDragRatio) {
            // Tie-breaker: lower drag coefficient is better
            if (current.dragCoefficient < best.dragCoefficient) {
                return current;
            }
        }
        return best;
    }, eligibleHistory[0]);
  }, [history]);

  const latestResult = history.length > 0 ? history[0] : null;

  useEffect(() => {
    setAnalysisContext(latestResult);
  }, [latestResult, setAnalysisContext]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile || !user) return;

    if (!selectedFile.name.toLowerCase().endsWith('.step') && !selectedFile.name.toLowerCase().endsWith('.stp')) {
      setError('Invalid file type. Please upload a .step or .stp file.');
      setAnalysisState('idle');
      return;
    }
    
    setAnalysisState('analyzing');
    setError(null);
    setSelectedForComparison([]);

    try {
      const result = await runAnalysis(selectedFile);
      setHistory(prev => historyService.addToHistory(user.email, result, prev));
      setAnalysisState('idle');
    } catch (e) {
      setError('An unexpected error occurred during analysis.');
      setAnalysisState('idle');
    }
  }, [user]);

  const handleToggleSelection = (resultId: string) => {
    setSelectedForComparison(prev => {
        if (prev.includes(resultId)) {
            return prev.filter(id => id !== resultId);
        }
        if (prev.length < 2) {
            return [...prev, resultId];
        }
        // If 2 are already selected, replace the first one
        return [prev[1], resultId];
    });
  };
  
  const handleCompareClick = () => {
    const resultsToCompare = history.filter(h => selectedForComparison.includes(h.id)).sort((a,b) => selectedForComparison.indexOf(a.id) - selectedForComparison.indexOf(b.id));
    if (resultsToCompare.length === 2) {
        onCompare(resultsToCompare);
    }
  };

  const handleCompareToBest = (resultId: string) => {
    if (!bestCar) return;
    const selectedCar = history.find(h => h.id === resultId);
    if (selectedCar) {
      onCompare([selectedCar, bestCar]);
    }
  };

  const handleClearHistory = () => {
    if (user && window.confirm('Are you sure you want to clear your entire test history? This cannot be undone.')) {
      setHistory([]);
      historyService.clearHistory(user.email);
    }
  };
  

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {analysisState === 'analyzing' ? (
        <div className="text-center bg-background-secondary p-8 rounded-lg border border-border-color shadow-2xl">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Analyzing Vehicle Geometry...</h2>
          <div className="relative w-full h-2 bg-background-tertiary rounded-full overflow-hidden mt-6">
            <div className="absolute top-0 left-0 h-full bg-primary w-1/2 animate-indeterminate-progress rounded-full"></div>
          </div>
          <p className="text-text-primary text-lg mt-4">Running CFD simulation, please wait.</p>
        </div>
      ) : (
        <FileUpload onFileSelect={handleFileSelect} error={error} />
      )}
      <style>{`
        @keyframes indeterminate-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
        .animate-indeterminate-progress {
            animation: indeterminate-progress 2s infinite ease-in-out;
        }
      `}</style>
      
      {bestCar && <BestCarDisplay bestCar={bestCar} onCompare={() => handleCompareToBest(bestCar.id)}/>}

      <div className="bg-background-secondary rounded-lg p-6 shadow-2xl border border-border-color">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-text-primary">Test History</h2>
          <div className="flex items-center space-x-2">
            <button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="bg-danger/80 hover:bg-danger text-text-on-primary font-bold text-sm py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear History
            </button>
            <button 
              onClick={handleCompareClick} 
              disabled={selectedForComparison.length !== 2}
              className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare Selected ({selectedForComparison.length}/2)
            </button>
          </div>
        </div>
        {history.length === 0 ? (
          <p className="text-text-secondary text-center py-8">Your analysis results will appear here.</p>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto space-y-3 pr-2">
            {history.map(res => (
              <div 
                key={res.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 transform ${selectedForComparison.includes(res.id) ? 'bg-primary/20 ring-2 ring-accent scale-[1.01]' : 'bg-background-tertiary hover:bg-border-color/50 hover:-translate-y-0.5'}`} 
              >
                <div 
                    className="flex items-center gap-3 w-full cursor-pointer rounded-l-md p-1 -m-1"
                    onClick={() => handleToggleSelection(res.id)}
                >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 flex-shrink-0 ${selectedForComparison.includes(res.id) ? 'bg-primary border-accent' : 'bg-background-secondary border-border-color'}`}>
                      {selectedForComparison.includes(res.id) && <svg className="w-4 h-4 text-text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="truncate pr-2">
                      <p className="font-bold text-text-primary truncate" title={res.fileName}>{res.fileName}</p>
                      <p className="text-sm text-text-secondary">Cd: {res.dragCoefficient.toFixed(4)} | Cl: {res.liftCoefficient.toFixed(4)} | L/D: {res.liftToDragRatio.toFixed(3)}</p>
                    </div>
                </div>
                {bestCar && bestCar.id !== res.id && (
                  <button onClick={() => handleCompareToBest(res.id)} className="text-xs font-semibold bg-warning/20 text-warning/80 hover:bg-warning/40 rounded-md px-2 py-1 ml-2 flex-shrink-0 transition-colors">
                      Vs Best
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {latestResult && analysisState === 'idle' && (
        <AnalysisDisplay
          fileName={latestResult.fileName}
          analysisState={'complete'}
          result={latestResult}
        />
      )}
    </div>
  );
};

export default TestingPage;
