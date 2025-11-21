import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label,
  ReferenceLine
} from 'recharts';
import { Coefficients } from '../types';
import { evaluateQuadratic } from '../services/mathUtils';
import { TranslationResource } from '../services/translations';

interface PredictionChartProps {
  coefficients: Coefficients;
  predictionInput: number;
  t: TranslationResource;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  coefficients,
  predictionInput,
  t
}) => {
  
  // Generate points for the curve
  const lineData = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 55; i += 1) {
      points.push({ x: i, curveY: evaluateQuadratic(coefficients, i) });
    }
    return points;
  }, [coefficients]);

  const predictedValue = useMemo(() => {
      return evaluateQuadratic(coefficients, predictionInput);
  }, [coefficients, predictionInput]);

  return (
    <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow-inner border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={lineData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 55]} 
            unit={t.doseUnit}
            tick={{ fill: '#94a3b8' }}
            allowDataOverflow
          >
             <Label value={t.predX} offset={0} position="bottom" fill="#94a3b8" fontSize={12} />
          </XAxis>
          <YAxis 
            type="number" 
            domain={[60, 200]} 
            unit=""
            tick={{ fill: '#94a3b8' }}
          >
             <Label value={t.predY} angle={-90} position="insideLeft" fill="#94a3b8" fontSize={12} />
          </YAxis>
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(v) => `${t.colDose}: ${v}${t.doseUnit}`}
            formatter={(value: number) => [value.toFixed(1), t.colBP]}
          />
          
          {/* The Regression Curve - consistent with main chart */}
          <Line
            type="monotone"
            dataKey="curveY"
            stroke="#ef4444" 
            strokeWidth={3}
            dot={false}
            name={t.seriesModel}
            animationDuration={0} 
            isAnimationActive={false} 
          />

          {/* Visual Guide Lines */}
          <ReferenceLine x={predictionInput} stroke="#10b981" strokeDasharray="3 3" />
          <ReferenceLine y={predictedValue} stroke="#10b981" strokeDasharray="3 3" />

          {/* Prediction Dot */}
          <ReferenceDot
            x={predictionInput}
            y={predictedValue}
            r={6}
            fill="#10b981"
            stroke="white"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;
