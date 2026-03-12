import React from 'react';

interface Props {
  type?: 'info' | 'warning' | 'success' | 'danger' | 'note';
  title?: string;
  children: React.ReactNode;
}

const Callout: React.FC<Props> = ({ type = 'info', title, children }) => {
  const themes = {
    info: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/30',
      border: 'border-blue-500/50 dark:border-blue-400/30',
      text: 'text-blue-900 dark:text-blue-200',
      icon: 'ℹ️',
      accent: 'bg-blue-500'
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/30',
      border: 'border-amber-500/50 dark:border-amber-400/30',
      text: 'text-amber-900 dark:text-amber-200',
      icon: '⚠️',
      accent: 'bg-amber-500'
    },
    success: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
      border: 'border-emerald-500/50 dark:border-emerald-400/30',
      text: 'text-emerald-900 dark:text-emerald-200',
      icon: '✅',
      accent: 'bg-emerald-500'
    },
    danger: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/30',
      border: 'border-rose-500/50 dark:border-rose-400/30',
      text: 'text-rose-900 dark:text-rose-200',
      icon: '🛑',
      accent: 'bg-rose-500'
    },
    note: {
      bg: 'bg-slate-50/50 dark:bg-slate-800/50',
      border: 'border-slate-500/50 dark:border-slate-400/30',
      text: 'text-slate-900 dark:text-slate-200',
      icon: '📝',
      accent: 'bg-slate-500'
    }
  };

  const theme = themes[type];

  return (
    <div className={`not-prose my-8 overflow-hidden rounded-2xl border ${theme.bg} ${theme.border} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex">
        {/* Left vertical accent bar */}
        <div className={`w-2 ${theme.accent}`}></div>

        <div className="flex-1 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl" role="img" aria-hidden="true">{theme.icon}</span>
            {title ? (
              <span className={`font-bold text-sm uppercase tracking-widest opacity-80 ${theme.text}`}>
                {title}
              </span>
            ) : (
              <span className={`font-bold text-sm uppercase tracking-widest opacity-80 ${theme.text}`}>
                {type}
              </span>
            )}
          </div>
          <div className={`text-base leading-relaxed font-medium ${theme.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callout;
