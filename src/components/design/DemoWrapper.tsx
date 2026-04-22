import React from 'react';
import InfoTooltip from './InfoTooltip';

interface DemoWrapperProps {
  title: string;
  tooltip?: React.ReactNode;
  children: React.ReactNode;
  controls?: React.ReactNode;
}

const DemoWrapper: React.FC<DemoWrapperProps> = ({ title, tooltip, children, controls }) => {
  return (
    <div className="not-prose max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 font-sans my-12 overflow-hidden">
      {/* Header with Dots */}
      <div className="bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 border-b border-slate-700 dark:border-slate-600 flex justify-between items-center relative z-20">
        <div className="flex items-center">
          <h3 className="flex items-center gap-2 font-bold text-lg tracking-tight" data-toc-skip>
            {title}
            <div className="inline-flex items-center translate-y-[1px]">
              {tooltip && <InfoTooltip position="bottom" content={tooltip} />}
            </div>
          </h3>
        </div>
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm shadow-red-900/20"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm shadow-yellow-900/20"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm shadow-green-900/20"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[450px]">
        {/* Sidebar Controls */}
        {controls && (
          <div className="w-full lg:w-80 p-6 bg-slate-50/50 dark:bg-slate-900/20 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 flex flex-col gap-6 overflow-y-auto">
            {controls}
          </div>
        )}

        {/* Main Visualization Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center bg-white dark:bg-slate-800 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DemoWrapper;
