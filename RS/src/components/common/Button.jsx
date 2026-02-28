import React from 'react';

const Button = ({ label, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all rounded-none flex items-center justify-center text-center";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
    outline: "bg-white dark:bg-slate-900 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    secondary: "bg-slate-800 text-white hover:bg-slate-950 border border-slate-700"
  };

  
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;