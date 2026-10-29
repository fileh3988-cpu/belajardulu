'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('elegant');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Load tema dari localStorage saat pertama kali buka
    const savedTheme = localStorage.getItem('app-theme') || 'elegant';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Listener untuk sinkronisasi antar tab browser
    const handleStorageChange = (e) => {
      if (e.key === 'app-theme') {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'elegant' ? 'modern' : 'elegant';
    
    // Trigger animasi transisi
    setIsTransitioning(true);
    document.body.classList.add(`theme-transitioning-${newTheme}`);
    
    setTimeout(() => {
      applyTheme(newTheme);
      localStorage.setItem('app-theme', newTheme);
      document.body.classList.remove(`theme-transitioning-${theme}`);
      setIsTransitioning(false);
    }, 300); // Ganti tema di tengah animasi
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);