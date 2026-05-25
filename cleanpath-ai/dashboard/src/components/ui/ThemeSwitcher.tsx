import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

type Theme = 'default' | 'dark' | 'system';

export const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('default');

    useEffect(() => {
        // Load initial theme from localStorage or default to 'default' (Light)
        const savedTheme = localStorage.getItem('cleanpath_theme') as Theme || 'default';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (targetTheme: Theme) => {
        const root = window.document.documentElement;
        
        // Remove existing theme class
        root.classList.remove('dark');

        if (targetTheme === 'dark') {
            root.classList.add('dark');
        } else if (targetTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            }
        }
        
        // Save choice
        localStorage.setItem('cleanpath_theme', targetTheme);
        
        // Dispatch custom event so dynamic sub-pages render perfectly
        window.dispatchEvent(new Event('cleanpath_theme_change'));
    };

    // Set up a listener for system preference wiggles in real time
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#080A0F]/5 dark:bg-[#080A0F] border border-black/5 dark:border-white/5 font-mono select-none">
            <button
                onClick={() => handleThemeChange('default')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                    theme === 'default'
                        ? 'bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/15 text-black dark:text-white'
                        : 'bg-transparent text-black/40 dark:text-white/30 hover:text-black/80 dark:hover:text-white/70'
                }`}
                title="Default Light Mode"
            >
                <Sun className="w-3 h-3" />
                <span className="hidden sm:inline">Default</span>
            </button>
            
            <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                    theme === 'dark'
                        ? 'bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/15 text-black dark:text-white'
                        : 'bg-transparent text-black/40 dark:text-white/30 hover:text-black/80 dark:hover:text-white/70'
                }`}
                title="Dark Mode"
            >
                <Moon className="w-3 h-3" />
                <span className="hidden sm:inline">Dark</span>
            </button>

            <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                    theme === 'system'
                        ? 'bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/15 text-black dark:text-white'
                        : 'bg-transparent text-black/40 dark:text-white/30 hover:text-black/80 dark:hover:text-white/70'
                }`}
                title="System Reference Theme"
            >
                <Laptop className="w-3 h-3" />
                <span className="hidden sm:inline">System</span>
            </button>
        </div>
    );
};
