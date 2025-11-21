import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Label
} from 'recharts';
import { DataPoint, Coefficients } from '../types';
import { evaluateQuadratic } from '../services/mathUtils';
import { TranslationResource } from '../services/translations';

interface ChartVisualizationProps {
  dataPoints: DataPoint[];
  coefficients: Coefficients;
  t: TranslationResource;
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  dataPoints,
  coefficients,
  t
}) => {
  
  // Generate points for the curve (quadratic needs more points than linear)
  const lineData = useMemo(() => {
    const points = [];
    // Generate 60 points for smooth curve from x=0 to x=55
    for (let i = 0; i <= 55; i += 1) {
      points.push({ x: i, curveY: evaluateQuadratic(coefficients, i) });
    }
    return points;
  }, [coefficients]);

  return (
    <div className="w-full h-[400px] bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 55]} 
            unit={t.doseUnit}
            tick={{ fill: '#64748b' }}
            allowDataOverflow
          >
             <Label value={t.chartX} offset={0} position="bottom" fill="#64748b" fontSize={12} />
          </XAxis>
          <YAxis 
            dataKey="y" 
            type="number" 
            domain={[60, 200]} 
            unit=""
            tick={{ fill: '#64748b' }}
          >
             <Label value={t.chartY} angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
          </YAxis>
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(v) => `${t.colDose}: ${v}${t.doseUnit}`}
          />
          
          {/* The Regression Curve */}
          <Line
            data={lineData}
            type="monotone"
            dataKey="curveY"
            stroke="#ef4444" // Red for medical/health context
            strokeWidth={3}
            dot={false}
            name={t.seriesModel}
            animationDuration={0} 
            isAnimationActive={false} 
          />

          {/* Actual Data Points */}
          <Scatter 
            data={dataPoints} 
            fill="#3b82f6" 
            name={t.seriesData} 
            shape="circle"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartVisualization;
