import React from 'react';
import { Key, XCircle } from 'lucide-react';

const MinimizedSuccessCard = ({ data, onExpand, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex items-center gap-2 animate-in slide-in-from-right duration-300">
      <button 
        onClick={onExpand}
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl transition-all border-2 border-white group"
      >
        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
          <Key size={18} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase opacity-80 leading-none mb-1">
            View Last Approved
          </p>
          <p className="text-xs font-bold truncate max-w-[120px]">
            {data.name}
          </p>
        </div>
      </button>
      
      <button 
        onClick={onClose} 
        className="p-2 bg-slate-800 text-white rounded-full hover:bg-red-500 shadow-lg transition-colors border-2 border-white"
        title="Clear notification"
      >
        <XCircle size={20} />
      </button>
    </div>
  );
};

export default MinimizedSuccessCard;