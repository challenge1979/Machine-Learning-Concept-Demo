import React, { useState } from 'react';
import { Trash2, Plus, AlertCircle, Table as TableIcon } from 'lucide-react';
import { DataPoint } from '../types';
import { TranslationResource } from '../services/translations';

interface DataTableProps {
  data: DataPoint[];
  onAdd: (x: number, y: number) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
  t: TranslationResource;
}

const DataTable: React.FC<DataTableProps> = ({ data, onAdd, onDelete, isEditable, t }) => {
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const x = parseFloat(newX);
    const y = parseFloat(newY);

    if (isNaN(x) || isNaN(y)) {
        setError(t.validationNumber);
        return;
    }
    if (x < 0 || x > 60) {
        setError(t.validationDose);
        return;
    }
    if (y < 0 || y > 250) {
        setError(t.validationBP);
        return;
    }

    onAdd(x, y);
    setNewX('');
    setNewY('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[400px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
            <TableIcon size={16} className="text-slate-500"/>
            <h3 className="font-bold text-slate-700">{t.tableTitle} ({data.length})</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isEditable ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
          {isEditable ? t.editable : t.locked}
        </span>
      </div>
      
      {/* Add Point Form */}
      {isEditable && (
        <div className="shrink-0 bg-indigo-50/50 border-b border-indigo-100 p-3">
            <form onSubmit={handleAdd} className="flex gap-2 items-start">
                <div className="flex-1">
                    <input 
                    type="number" 
                    step="0.1" 
                    placeholder={t.placeholderDose}
                    className="w-full px-3 py-2 rounded-lg border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 border outline-none"
                    value={newX}
                    onChange={e => setNewX(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <input 
                    type="number" 
                    step="0.1" 
                    placeholder={t.placeholderBP}
                    className="w-full px-3 py-2 rounded-lg border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 border outline-none"
                    value={newY}
                    onChange={e => setNewY(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    title={t.colAction}
                >
                    <Plus size={20} />
                </button>
            </form>
            {error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-pulse">
                    <AlertCircle size={12}/> {error}
                </div>
            )}
        </div>
      )}

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 backdrop-blur sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold">{t.colId}</th>
              <th className="px-4 py-3 font-semibold">{t.colDose}</th>
              <th className="px-4 py-3 font-semibold">{t.colBP}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.colAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {data.map((point, index) => (
               <tr key={point.id} className="hover:bg-slate-50 transition-colors group">
                 <td className="px-4 py-2.5 font-mono text-slate-400 text-xs">#{index + 1}</td>
                 <td className="px-4 py-2.5 font-medium text-slate-700">{point.x} <span className="text-slate-400 text-xs font-normal">{t.doseUnit}</span></td>
                 <td className="px-4 py-2.5 text-slate-600">{point.y} <span className="text-slate-400 text-xs font-normal">{t.bpUnit}</span></td>
                 <td className="px-4 py-2.5 text-right">
                   <button 
                     onClick={() => onDelete(point.id)}
                     disabled={!isEditable}
                     className={`p-1.5 rounded-md transition-all ${isEditable ? 'text-slate-300 hover:text-red-500 hover:bg-red-50 group-hover:text-slate-400' : 'text-slate-200 cursor-not-allowed'}`}
                     title="Delete"
                   >
                     <Trash2 size={14} />
                   </button>
                 </td>
               </tr>
             ))}
             {data.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <TableIcon className="text-slate-300" />
                            </div>
                            <p>{t.noData}</p>
                        </div>
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
