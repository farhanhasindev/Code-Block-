
import React, { useState, useCallback, useEffect } from 'react';
import { BlockType, BlockInstance, BlockCategory } from './types';
import { BLOCK_TEMPLATES } from './constants';
import { Block } from './components/Block';
import { Console } from './components/Console';
import { gemini } from './geminiService';
import { 
  Play, 
  Save, 
  FolderOpen, 
  Trash2, 
  Plus, 
  Sparkles,
  Zap,
  HelpCircle,
  Code2,
  BoxSelect,
  RefreshCw
} from 'lucide-react';

interface LogEntry {
  type: 'log' | 'ai' | 'error' | 'image' | 'search';
  message: string;
  timestamp: string;
  data?: any;
}

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<BlockCategory | 'all'>('all');

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ type, message, timestamp, data }, ...prev]);
  };

  const addBlock = (type: BlockType) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock: BlockInstance = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      category: template.category,
      values: template.inputs.reduce((acc, input) => {
        acc[input.name] = input.defaultValue;
        return acc;
      }, {} as any),
      children: template.isContainer ? [] : undefined
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<BlockInstance>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const executeBlocks = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    addLog('log', 'Starting execution engine...');
    const variables: Record<string, any> = {};

    const runBlock = async (block: BlockInstance) => {
      setRunningBlockId(block.id);
      await new Promise(resolve => setTimeout(resolve, 350)); // Visual delay

      switch (block.type) {
        case BlockType.PRINT:
          addLog('log', `> ${block.values.value}`);
          break;
        case BlockType.ALERT:
          window.alert(block.values.message);
          break;
        case BlockType.CONSOLE_LOG:
          addLog('log', `[System] ${block.values.value}`);
          break;
        case BlockType.SET_VAR:
          variables[block.values.name] = block.values.value;
          addLog('log', `Variable set: ${block.values.name} = ${block.values.value}`);
          break;
        case BlockType.MATH_OP: {
          const { op, val1, val2 } = block.values;
          let res = 0;
          if (op === '+') res = val1 + val2;
          if (op === '-') res = val1 - val2;
          if (op === '*') res = val1 * val2;
          if (op === '/') res = val1 / val2;
          addLog('log', `Math result (${val1} ${op} ${val2}): ${res}`);
          break;
        }
        case BlockType.RANDOM: {
          const { min, max } = block.values;
          const res = Math.floor(Math.random() * (max - min + 1)) + min;
          addLog('log', `Generated random: ${res}`);
          break;
        }
        case BlockType.REPEAT: {
          const times = Number(block.values.times) || 0;
          for (let i = 0; i < times; i++) {
            if (block.children) {
              for (const child of block.children) {
                await runBlock(child);
              }
            }
          }
          break;
        }
        case BlockType.IF: {
          const condition = block.values.condition === 'true';
          if (condition && block.children) {
            for (const child of block.children) {
              await runBlock(child);
            }
          }
          break;
        }
        case BlockType.GEMINI_ASK: {
          addLog('ai', `Thinking: "${block.values.prompt}"...`);
          const aiResult = await gemini.generateResponse(block.values.prompt);
          addLog('ai', aiResult);
          break;
        }
        case BlockType.GEMINI_IMAGE: {
          addLog('image', `Creating art: "${block.values.prompt}"...`);
          const imgUrl = await gemini.generateImage(block.values.prompt);
          if (imgUrl) {
            addLog('image', `Art generated for: "${block.values.prompt}"`, imgUrl);
          } else {
            addLog('error', `Failed to generate image.`);
          }
          break;
        }
        case BlockType.GEMINI_SEARCH: {
          addLog('search', `Searching web: "${block.values.query}"...`);
          const result = await gemini.searchGrounding(block.values.query);
          addLog('search', result.text, result.sources);
          break;
        }
      }
    };

    try {
      for (const block of blocks) {
        await runBlock(block);
      }
      addLog('log', 'Execution finished.');
    } catch (err) {
      addLog('error', `Runtime error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setRunningBlockId(null);
      setIsExecuting(false);
    }
  };

  const handleGeminiAnalyze = async () => {
    if (blocks.length === 0) {
      setAiInsights("The workspace is empty. Let's build something!");
      return;
    }
    setAiInsights("Analyzing architectural logic...");
    const explanation = await gemini.explainCode(JSON.stringify(blocks));
    setAiInsights(explanation);
  };

  const saveProject = () => {
    localStorage.setItem('codeblock_project', JSON.stringify(blocks));
    addLog('log', 'Project snapshots saved.');
  };

  const loadProject = () => {
    const saved = localStorage.getItem('codeblock_project');
    if (saved) {
      setBlocks(JSON.parse(saved));
      addLog('log', 'Project snapshots loaded.');
    }
  };

  const clearWorkspace = () => {
    if (window.confirm("Purge all logic blocks from canvas?")) {
      setBlocks([]);
      setLogs([]);
      setAiInsights("");
      addLog('log', 'Workspace reset.');
    }
  };

  const categories: BlockCategory[] = ['logic', 'math', 'loops', 'text', 'variables', 'actions', 'ai'];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-100">
      {/* Tool Palette */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-slate-900 shadow-2xl z-20">
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-white">CodeBlock</h1>
              <div className="flex items-center gap-1.5 opacity-50">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest">v2.5 Engine Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar bg-slate-900/50">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {Object.entries(BLOCK_TEMPLATES)
            .filter(([_, t]) => activeCategory === 'all' || t.category === activeCategory)
            .map(([type, template]) => (
            <div 
              key={type}
              onClick={() => addBlock(type as BlockType)}
              className="group relative bg-white/5 border border-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:bg-white/[0.08] hover:scale-[1.02] active:scale-95 shadow-lg overflow-hidden"
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${template.color}`} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{template.category}</span>
                <Plus size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="font-bold text-sm tracking-tight text-slate-200">{template.label}</div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-white/5 bg-slate-950">
          <button 
            onClick={handleGeminiAnalyze}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            <Sparkles size={16} />
            Architect Review
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Workspace Toolbar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={executeBlocks}
              disabled={isExecuting || blocks.length === 0}
              className="flex items-center gap-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl shadow-blue-500/20 transition-all active:scale-95 group"
            >
              {isExecuting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} className="fill-white" />}
              <span>{isExecuting ? 'Processing...' : 'Deploy Logic'}</span>
            </button>
            
            <div className="h-8 w-px bg-white/10" />
            
            <div className="flex items-center gap-3">
              <button onClick={saveProject} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Snapshot Logic"><Save size={20} /></button>
              <button onClick={loadProject} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Restore Logic"><FolderOpen size={20} /></button>
              <button onClick={clearWorkspace} className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Purge Workspace"><Trash2 size={20} /></button>
            </div>
          </div>

          <div className="flex items-center gap-5">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
               <div className="relative">
                 <Zap size={14} className="text-amber-400" />
                 <div className="absolute inset-0 animate-ping opacity-20"><Zap size={14} className="text-amber-400" /></div>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Flash-Gen Ready</span>
             </div>
             <button className="text-slate-500 hover:text-white transition-colors">
               <HelpCircle size={22} />
             </button>
          </div>
        </header>

        {/* Blueprint Grid Canvas */}
        <div className="flex-1 relative overflow-auto p-16 bg-[radial-gradient(rgba(255,255,255,0.05)_1.5px,transparent_1.5px)] [background-size:32px_32px]">
          {blocks.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 select-none">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center mb-6">
                <BoxSelect size={48} className="text-slate-700" />
              </div>
              <p className="text-2xl font-black uppercase tracking-[0.2em] text-slate-700">Canvas Initialized</p>
              <p className="text-sm font-medium text-slate-800 mt-2 italic">Drag components to begin architecting</p>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-3xl mx-auto">
              {blocks.map(block => (
                <Block 
                  key={block.id} 
                  block={block} 
                  isRunning={runningBlockId === block.id}
                  onUpdate={updateBlock} 
                  onDelete={deleteBlock} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Terminal Section */}
        <div className="h-80 border-t border-white/5 shadow-2xl">
          <Console 
            logs={logs} 
            onClear={() => setLogs([])} 
            aiInsights={aiInsights} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;
