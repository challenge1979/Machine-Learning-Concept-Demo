import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RefreshCw, 
  Play, 
  Calculator, 
  Info,
  Activity, 
  Target,
  ArrowDown,
  Brain
} from 'lucide-react';
import { DataPoint, Coefficients, AppState, Language } from './types';
import { calculateQuadraticRegression, generateFixedData, evaluateQuadratic } from './services/mathUtils';
import { translations } from './services/translations';
import ChartVisualization from './components/ChartVisualization';
import FormulaDisplay from './components/FormulaDisplay';
import DataTable from './components/DataTable';
import PredictionChart from './components/PredictionChart';

const App: React.FC = () => {
  // State
  const [language, setLanguage] = useState<Language>('en');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  // Initial state for quadratic: y = 160 (flat line approx) -> 0x^2 + 0x + 160
  const [currentCoeffs, setCurrentCoeffs] = useState<Coefficients>({ a: 0, b: 0, c: 160 });
  const [targetCoeffs, setTargetCoeffs] = useState<Coefficients>({ a: 0, b: 0, c: 160 });
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [predictionInput, setPredictionInput] = useState<number>(20);
  
  const t = translations[language];

  // Refs for animation
  const requestRef = useRef<number>(0);
  const coeffsRef = useRef<Coefficients>({ a: 0, b: 0, c: 160 });

  // Handlers
  const handleGenerateData = useCallback(() => {
    const newData = generateFixedData(); // Use fixed 10 points
    setDataPoints(newData);
    // Reset model
    setAppState(AppState.IDLE);
    
    // Reset coefficients to a reasonable starting horizontal line
    const startCoeffs = { a: 0, b: 0, c: 160 };
    coeffsRef.current = startCoeffs;
    setCurrentCoeffs(startCoeffs);
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  const handleAddPoint = (x: number, y: number) => {
    const newPoint: DataPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y
    };
    // Sort by x for consistent display in list, though math doesn't care
    setDataPoints(prev => [...prev, newPoint].sort((a, b) => a.x - b.x));
  };

  const handleDeletePoint = (id: string) => {
    setDataPoints(prev => prev.filter(p => p.id !== id));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // Initial load
  useEffect(() => {
    handleGenerateData();
  }, [handleGenerateData]);

  // Animation Loop
  const animate = useCallback(() => {
    const speed = 0.05; // Slightly slower for 3 params stability visual
    
    const current = coeffsRef.current;
    
    // Interpolation
    const nextA = current.a + (targetCoeffs.a - current.a) * speed;
    const nextB = current.b + (targetCoeffs.b - current.b) * speed;
    const nextC = current.c + (targetCoeffs.c - current.c) * speed;

    // Convergence check
    const isDone = 
      Math.abs(targetCoeffs.a - nextA) < 0.0001 &&
      Math.abs(targetCoeffs.b - nextB) < 0.001 &&
      Math.abs(targetCoeffs.c - nextC) < 0.01;

    coeffsRef.current = { a: nextA, b: nextB, c: nextC };
    setCurrentCoeffs({ ...coeffsRef.current });

    if (!isDone) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setAppState(AppState.TRAINED);
    }
  }, [targetCoeffs]);

  useEffect(() => {
    if (appState === AppState.TRAINING) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [appState, animate]);

  const handleTrain = () => {
    const bestFit = calculateQuadraticRegression(dataPoints);
    setTargetCoeffs(bestFit);
    setAppState(AppState.TRAINING);
  };

  const handlePredictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) {
        // Allow typing to start with empty or invalid, but for range slider sync, fallback to 0 if needed, 
        // but better to just not update state if invalid during typing, or default to 0.
        // Here we default to 0 for simplicity in 'number' input
        val = 0; 
    }
    // Clamp to 0-50 as requested
    if (val < 0) val = 0;
    if (val > 50) val = 50;
    setPredictionInput(val);
  };

  const predictedY = evaluateQuadratic(currentCoeffs, predictionInput);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-red-500 p-2 rounded-lg text-white shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight hidden sm:block">{t.title}</h1>
              <h1 className="text-lg font-bold text-slate-900 leading-tight sm:hidden">Model Concept Demo</h1>
              <p className="text-sm text-slate-500 hidden md:block">{t.subtitle}</p>
            </div>
          </div>

          {/* Centered Language Button */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={toggleLanguage}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-300 shadow-sm"
              >
                {t.languageBtn}
              </button>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${appState === AppState.TRAINED ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {appState === AppState.TRAINED ? t.statusReady : t.statusWaiting}
             </span>
          </div>
        </div>
      </header>

      <main>
        
        {/* Top Section: Training & Data */}
        <section className="bg-slate-50 py-10 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Header Label */}
            <div className="flex items-center gap-2 mb-6">
                <Brain className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800">{t.sectionTraining}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (4 cols): Data Table & Controls */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Data Table (Top Left) */}
                <DataTable 
                  data={dataPoints}
                  onAdd={handleAddPoint}
                  onDelete={handleDeletePoint}
                  isEditable={appState === AppState.IDLE}
                  t={t}
                />
                
                {/* Controls (Bottom Left) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="text-sm text-slate-600 flex items-start gap-2">
                      <Info className="shrink-0 text-indigo-500 mt-0.5" size={16} />
                      <p>{t.infoText}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={handleGenerateData}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium text-sm w-full"
                      >
                        <RefreshCw size={16} />
                        {t.btnReset}
                      </button>
                      <button 
                        onClick={handleTrain}
                        disabled={appState !== AppState.IDLE || dataPoints.length < 3}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm shadow-md transition-all w-full
                          ${appState === AppState.IDLE && dataPoints.length >= 3
                            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:transform active:scale-95' 
                            : 'bg-indigo-300 cursor-not-allowed'}`}
                      >
                        <Play size={16} fill="currentColor" />
                        {appState === AppState.IDLE ? t.btnTrain : appState === AppState.TRAINING ? t.btnTraining : t.btnTrained}
                      </button>
                    </div>
                </div>
              </div>

              {/* Right Column (8 cols): Formula & Chart */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Formula Display (Top Right) */}
                <FormulaDisplay coefficients={currentCoeffs} t={t} />
                
                {/* Chart Visualization (Bottom Right) */}
                <ChartVisualization 
                  dataPoints={dataPoints}
                  coefficients={currentCoeffs}
                  t={t}
                />
              </div>

            </div>
          </div>
        </section>

        {/* Middle Section: Prediction Playground */}
        <section className={`py-10 transition-all duration-700 bg-indigo-50/40 ${appState === AppState.TRAINED ? 'opacity-100' : 'opacity-50 grayscale'}`}>
           <div className="max-w-6xl mx-auto px-4 sm:px-6">
               <div className="flex items-center gap-2 mb-6">
                   <Calculator className="text-indigo-600" size={24} />
                   <h2 className="text-xl font-bold text-slate-800">{t.sectionPrediction}</h2>
               </div>
               
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="grid md:grid-cols-2">
                      
                      {/* Left: Visualization */}
                      <div className="p-6 bg-white border-b md:border-b-0 md:border-r border-slate-100">
                           <div className="mb-2 flex items-center justify-between">
                               <span className="text-xs font-semibold text-slate-400 uppercase">{t.predChartTitle}</span>
                               {appState !== AppState.TRAINED && (
                                   <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded">{t.predNeedTrain}</span>
                               )}
                           </div>
                           <PredictionChart 
                              coefficients={currentCoeffs}
                              predictionInput={predictionInput}
                              t={t}
                           />
                      </div>

                      {/* Right: Controls & Result */}
                      <div className="p-8 flex flex-col justify-center bg-slate-50/50">
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-slate-700">
                                    {t.inputLabel}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min={0} 
                                        max={50} 
                                        value={predictionInput} 
                                        onChange={handlePredictionChange}
                                        disabled={appState !== AppState.TRAINED}
                                        className="w-20 px-2 py-1 text-right border border-slate-600 bg-slate-800 rounded-md text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <span className="text-indigo-600 font-mono font-bold">{t.doseUnit}</span>
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="50" 
                                step="1" 
                                value={predictionInput} 
                                onChange={handlePredictionChange}
                                disabled={appState !== AppState.TRAINED}
                                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                                <span>0{t.doseUnit}</span>
                                <span>50{t.doseUnit}</span>
                            </div>
                          </div>

                          <div className="flex justify-center my-2">
                              <ArrowDown className="text-slate-300 animate-bounce" />
                          </div>

                          <div className="mt-4">
                              <label className="block text-sm font-bold text-slate-700 mb-4">
                                  <span>{t.outputLabel}</span>
                              </label>
                              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
                                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                   <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{t.colBP}</span>
                                   <div className="text-4xl font-bold text-slate-800 mt-2 flex items-baseline justify-center gap-2">
                                       {Math.max(0, predictedY).toFixed(1)}
                                       <span className="text-lg text-slate-500 font-medium">{t.bpUnit}</span>
                                   </div>
                              </div>
                          </div>
                      </div>

                  </div>
               </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default App;