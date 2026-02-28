import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogOut } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    logout();
    
    // Redirect to AuthPage (root)
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <LogOut className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={24} />
      </div>
      <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-[5px] animate-pulse">Closing Portal Session...</p>
    </div>
  );
};

export default Logout;