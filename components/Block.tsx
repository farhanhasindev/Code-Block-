
import React from 'react';
import { BlockInstance, BlockType } from '../types';
import { BLOCK_TEMPLATES } from '../constants';
import { Trash2, GripVertical, ChevronRight, ChevronDown, Activity } from 'lucide-react';

interface BlockProps {
  block: BlockInstance;
  onUpdate: (id: string, updates: Partial<BlockInstance>) => void;
  onDelete: (id: string) => void;
  isNested?: boolean;
  isRunning?: boolean;
}

export const Block: React.FC<BlockProps> = ({ block, onUpdate, onDelete, isNested = false, isRunning = false }) => {
  const template = BLOCK_TEMPLATES[block.type];
  const [isExpanded, setIsExpanded] = React.useState(true);

  if (!template) return null;

  const handleInputChange = (name: string, value: any) => {
    onUpdate(block.id, {
      values: { ...block.values, [name]: value }
    });
  };

  const addNestedBlock = () => {
    const newId = `blk-${Date.now()}`;
    const newBlock: BlockInstance = {
      id: newId,
      type: BlockType.PRINT,
      category: 'text',
      values: { value: 'New Step' }
    };
    onUpdate(block.id, {
      children: [...(block.children || []), newBlock]
    });
  };

  return (
    <div className={`flex flex-col mb-2 group select-none transition-all duration-300 ${isNested ? 'ml-6' : ''} ${isRunning ? 'scale-[1.02]' : ''}`}>
      <div className={`flex items-center gap-3 p-3 rounded-xl shadow-sm border-l-4 transition-all ${isRunning ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-xl brightness-110' : 'hover:shadow-md'} ${template.color} text-white`}>
        <div className="flex items-center gap-2">
          {isRunning ? <Activity size={16} className="animate-pulse" /> : <GripVertical size={16} className="opacity-40 cursor-grab active:cursor-grabbing" />}
        </div>
        
        <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-tighter opacity-90">
          {template.isContainer && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-white/20 rounded p-0.5"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {template.label}
        </div>

        <div className="flex flex-wrap gap-2 items-center flex-1">
          {template.inputs.map((input) => (
            <div key={input.name} className="flex items-center gap-1">
              {input.type === 'select' ? (
                <select
                  className="bg-black/20 border-none rounded-md px-2 py-1 text-xs font-bold outline-none focus:ring-1 focus:ring-white/50"
                  value={block.values[input.name] || input.defaultValue}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                >
                  {input.options?.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                </select>
              ) : (
                <input
                  type={input.type}
                  className="bg-black/20 border-none rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-white/50 w-28 placeholder:text-white/40 font-medium"
                  value={block.values[input.name] ?? ''}
                  onChange={(e) => handleInputChange(input.name, input.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={input.name}
                />
              )}
            </div>
          ))}
        </div>

        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onDelete(block.id)}
            className="p-1.5 hover:bg-black/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {template.isContainer && isExpanded && (
        <div className="mt-1 border-l-2 border-dashed border-slate-300 ml-5 pl-2 py-2 flex flex-col min-h-[40px] bg-slate-50/30 rounded-br-2xl">
          {block.children?.map((child) => (
            <Block 
              key={child.id} 
              block={child} 
              isNested={true} 
              isRunning={false} // Local running state could be passed if needed
              onUpdate={(id, updates) => {
                const newChildren = block.children?.map(c => c.id === id ? { ...c, ...updates } : c);
                onUpdate(block.id, { children: newChildren });
              }}
              onDelete={(id) => {
                const newChildren = block.children?.filter(c => c.id !== id);
                onUpdate(block.id, { children: newChildren });
              }}
            />
          ))}
          <button 
            onClick={addNestedBlock}
            className="text-[9px] uppercase font-black text-slate-400 hover:text-blue-500 self-start ml-6 mt-1 flex items-center gap-1 transition-colors"
          >
            + Add Action
          </button>
        </div>
      )}
    </div>
  );
};
