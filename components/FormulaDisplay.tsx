import React from 'react';
import { Coefficients } from '../types';
import { TranslationResource } from '../services/translations';

interface FormulaDisplayProps {
  coefficients: Coefficients;
  t: TranslationResource;
}

const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ coefficients, t }) => {
  // Format numbers to be clean
  const format = (n: number) => {
      const absN = Math.abs(n);
      return absN < 0.001 ? absN.toExponential(2) : absN.toFixed(3);
  };
  
  const aVal = format(coefficients.a);
  const bVal = format(coefficients.b);
  const cVal = format(coefficients.c);

  // Signs
  const aSign = coefficients.a < 0 ? '-' : '';
  const bSign = coefficients.b < 0 ? '-' : '+';
  const cSign = coefficients.c < 0 ? '-' : '+';

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg text-center transition-all duration-300">
      <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">
        {t.formulaTitle}
      </h3>
      <div className="text-xl md:text-2xl font-mono font-bold tracking-tight flex flex-wrap justify-center items-baseline gap-1 mt-2">
        <span className="text-indigo-400">y</span>
        <span>=</span>
        {/* ax^2 */}
        <span className="flex items-baseline">
            <span className="text-pink-500 transition-all duration-75">{aSign}{aVal}</span>
            <span className="ml-0.5">x</span>
            <sup className="text-xs ml-0.5">2</sup>
        </span>
        {/* bx */}
        <span className="flex items-baseline ml-1">
            <span className="text-sky-400 mx-1">{bSign}</span>
            <span className="text-sky-400 transition-all duration-75">{bVal}</span>
            <span className="ml-0.5">x</span>
        </span>
        {/* c */}
        <span className="flex items-baseline ml-1">
            <span className="text-amber-400 mx-1">{cSign}</span>
            <span className="text-amber-400 transition-all duration-75">{cVal}</span>
        </span>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-xs text-slate-400 flex-wrap">
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <div className="text-left">
                <div className="font-bold text-slate-200">{t.legendCurvature}</div>
            </div>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sky-400"></div>
            <div className="text-left">
                <div className="font-bold text-slate-200">{t.legendLinear}</div>
            </div>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="text-left">
                <div className="font-bold text-slate-200">{t.legendIntercept}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaDisplay;
