import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const stored = window.localStorage.getItem('ekal-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = (stored as ThemeMode | null) ?? (prefersLight ? 'light' : 'dark');

    setTheme(initial);
    document.body.classList.toggle('light', initial === 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.body.classList.toggle('light', nextTheme === 'light');
    window.localStorage.setItem('ekal-theme', nextTheme);
  };

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    document.body.classList.toggle('light', newTheme === 'light');
    window.localStorage.setItem('ekal-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
