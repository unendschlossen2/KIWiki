import React from 'react';

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export default function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  let positionClasses = '';
  let arrowClasses = '';

  switch (position) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      arrowClasses = '-bottom-1 left-1/2 -translate-x-1/2';
      break;
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
      arrowClasses = '-top-1 left-1/2 -translate-x-1/2';
      break;
    case 'right':
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
      arrowClasses = '-left-1 top-1/2 -translate-y-1/2';
      break;
    case 'left':
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
      arrowClasses = '-right-1 top-1/2 -translate-y-1/2';
      break;
  }

  return (
    <div className="group relative inline-flex items-center ml-2">
      <div className="cursor-help w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
        i
      </div>
      <div className={`absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 ${positionClasses} w-64 p-3 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl pointer-events-none font-normal normal-case tracking-normal leading-relaxed text-left`}>
        {content}
        <div className={`absolute w-3 h-3 bg-slate-800 dark:bg-slate-700 rotate-45 ${arrowClasses}`}></div>
      </div>
    </div>
  );
}
