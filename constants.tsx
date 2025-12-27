
import { BlockType, BlockTemplate } from './types';

export const BLOCK_TEMPLATES: Record<string, BlockTemplate> = {
  [BlockType.PRINT]: {
    type: BlockType.PRINT,
    category: 'text',
    label: 'print',
    color: 'bg-blue-500',
    inputs: [{ name: 'value', type: 'string', defaultValue: 'Hello!' }]
  },
  [BlockType.ALERT]: {
    type: BlockType.ALERT,
    category: 'actions',
    label: 'alert',
    color: 'bg-indigo-600',
    inputs: [{ name: 'message', type: 'string', defaultValue: 'Alert!' }]
  },
  [BlockType.IF]: {
    type: BlockType.IF,
    category: 'logic',
    label: 'if',
    color: 'bg-amber-500',
    isContainer: true,
    inputs: [
      { name: 'condition', type: 'select', options: ['true', 'false'], defaultValue: 'true' }
    ]
  },
  [BlockType.REPEAT]: {
    type: BlockType.REPEAT,
    category: 'loops',
    label: 'repeat',
    color: 'bg-emerald-500',
    isContainer: true,
    inputs: [
      { name: 'times', type: 'number', defaultValue: 3 }
    ]
  },
  [BlockType.SET_VAR]: {
    type: BlockType.SET_VAR,
    category: 'variables',
    label: 'set variable',
    color: 'bg-purple-500',
    inputs: [
      { name: 'name', type: 'string', defaultValue: 'score' },
      { name: 'value', type: 'number', defaultValue: 10 }
    ]
  },
  [BlockType.MATH_OP]: {
    type: BlockType.MATH_OP,
    category: 'math',
    label: 'math',
    color: 'bg-rose-500',
    inputs: [
      { name: 'op', type: 'select', options: ['+', '-', '*', '/'], defaultValue: '+' },
      { name: 'val1', type: 'number', defaultValue: 1 },
      { name: 'val2', type: 'number', defaultValue: 1 }
    ]
  },
  [BlockType.RANDOM]: {
    type: BlockType.RANDOM,
    category: 'math',
    label: 'random number',
    color: 'bg-rose-600',
    inputs: [
      { name: 'min', type: 'number', defaultValue: 1 },
      { name: 'max', type: 'number', defaultValue: 100 }
    ]
  },
  [BlockType.GEMINI_ASK]: {
    type: BlockType.GEMINI_ASK,
    category: 'ai',
    label: 'Ask Gemini',
    color: 'bg-sky-500',
    inputs: [
      { name: 'prompt', type: 'string', defaultValue: 'Write a haiku about code' }
    ]
  },
  [BlockType.GEMINI_IMAGE]: {
    type: BlockType.GEMINI_IMAGE,
    category: 'ai',
    label: 'Generate Image',
    color: 'bg-pink-500',
    inputs: [
      { name: 'prompt', type: 'string', defaultValue: 'A futuristic cybernetic cat' }
    ]
  },
  [BlockType.GEMINI_SEARCH]: {
    type: BlockType.GEMINI_SEARCH,
    category: 'ai',
    label: 'Google Search',
    color: 'bg-orange-500',
    inputs: [
      { name: 'query', type: 'string', defaultValue: 'Current stock price of Google' }
    ]
  },
  [BlockType.CONSOLE_LOG]: {
    type: BlockType.CONSOLE_LOG,
    category: 'actions',
    label: 'system log',
    color: 'bg-slate-700',
    inputs: [{ name: 'value', type: 'string', defaultValue: 'Operation complete' }]
  }
};

export const CATEGORY_COLORS: Record<string, string> = {
  logic: 'border-amber-500',
  math: 'border-rose-500',
  loops: 'border-emerald-500',
  variables: 'border-purple-500',
  text: 'border-blue-500',
  actions: 'border-indigo-600',
  ai: 'border-sky-500'
};
