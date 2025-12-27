
import React from 'react';
import { Terminal, Info, Trash2, Cpu, ExternalLink, ImageIcon } from 'lucide-react';

interface LogEntry {
  type: 'log' | 'ai' | 'error' | 'image' | 'search';
  message: string;
  timestamp: string;
  data?: any;
}

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
  aiInsights?: string;
}

export const Console: React.FC<ConsoleProps> = ({ logs, onClear, aiInsights }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="flex items-center justify-between px-6 py-2 bg-slate-900 border-b border-white/5">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <Terminal size={14} className="text-blue-500" />
          <span>Debugger Terminal</span>
        </div>
        <button 
          onClick={onClear}
          className="text-slate-600 hover:text-white transition-colors p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 code-font text-xs leading-relaxed scroll-smooth flex flex-col gap-3">
        {logs.length === 0 ? (
          <div className="text-slate-700 font-medium select-none">Idle. Waiting for execution input...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`pb-3 border-b border-white/5 animate-in fade-in slide-in-from-left-2 duration-300`}>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] text-slate-600 font-bold">[{log.timestamp}]</span>
                 <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                   log.type === 'ai' ? 'bg-sky-500/20 text-sky-400' : 
                   log.type === 'image' ? 'bg-pink-500/20 text-pink-400' :
                   log.type === 'search' ? 'bg-orange-500/20 text-orange-400' :
                   'bg-slate-800 text-slate-400'
                 }`}>
                   {log.type}
                 </span>
              </div>
              
              <div className="text-slate-200 pl-2 border-l-2 border-white/10">
                {log.message}
                
                {log.type === 'image' && log.data && (
                  <div className="mt-4 relative group w-64">
                    <img 
                      src={log.data} 
                      alt="AI Generated" 
                      className="rounded-xl border border-white/10 shadow-2xl transition-transform hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon size={14} className="text-white" />
                    </div>
                  </div>
                )}

                {log.type === 'search' && log.data && log.data.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {log.data.map((src: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[10px] text-slate-400 transition-colors"
                      >
                        <ExternalLink size={10} />
                        {src.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {aiInsights && (
        <div className="p-5 bg-blue-950/20 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">
            <Cpu size={14} />
            <span>AI Code Architect</span>
          </div>
          <div className="text-[11px] text-sky-200/70 leading-relaxed italic">
            {aiInsights}
          </div>
        </div>
      )}
    </div>
  );
};
