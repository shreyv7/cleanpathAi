import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('light');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('cleanpath_theme') as Theme || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (targetTheme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove('dark');
        document.body.classList.remove('dark');

        if (targetTheme === 'dark') {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else if (targetTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
                document.body.classList.add('dark');
            }
        }
        
        localStorage.setItem('cleanpath_theme', targetTheme);
        window.dispatchEvent(new Event('cleanpath_theme_change'));
    };

    // Set up a listener for system preference changes
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

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        applyTheme(newTheme);
        setIsOpen(false);
    };

    const getActiveIcon = () => {
        if (theme === 'dark') return <Moon className="w-4 h-4 text-emerald-400" />;
        if (theme === 'system') return <Laptop className="w-4 h-4 text-blue-500" />;
        return <Sun className="w-4 h-4 text-amber-500" />;
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#0A0C10] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.05] transition-all cursor-pointer shadow-sm"
                title="Change appearance theme"
            >
                {getActiveIcon()}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 z-50 w-32 p-1 rounded-xl bg-white border border-slate-200 shadow-xl dark:bg-[#0B0D14] dark:border-white/10 dark:shadow-black/50 animate-in fade-in slide-in-from-top-1 duration-100 flex flex-col gap-0.5">
                    <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            theme === 'light'
                                ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                    >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light</span>
                    </button>
                    
                    <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            theme === 'dark'
                                ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                    >
                        <Moon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dark</span>
                    </button>

                    <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            theme === 'system'
                                ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                    >
                        <Laptop className="w-3.5 h-3.5 text-blue-500" />
                        <span>System</span>
                    </button>
                </div>
            )}
        </div>
    );
};
