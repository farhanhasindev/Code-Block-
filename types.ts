
export type BlockCategory = 'logic' | 'math' | 'loops' | 'variables' | 'text' | 'actions' | 'ai';

export enum BlockType {
  IF = 'IF',
  REPEAT = 'REPEAT',
  PRINT = 'PRINT',
  SET_VAR = 'SET_VAR',
  GET_VAR = 'GET_VAR',
  MATH_OP = 'MATH_OP',
  RANDOM = 'RANDOM',
  COMPARE = 'COMPARE',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  ALERT = 'ALERT',
  GEMINI_ASK = 'GEMINI_ASK',
  GEMINI_IMAGE = 'GEMINI_IMAGE',
  GEMINI_SEARCH = 'GEMINI_SEARCH',
  CONSOLE_LOG = 'CONSOLE_LOG'
}

export interface BlockInstance {
  id: string;
  type: BlockType;
  category: BlockCategory;
  values: Record<string, any>;
  children?: BlockInstance[];
  next?: BlockInstance;
}

export interface BlockTemplate {
  type: BlockType;
  category: BlockCategory;
  label: string;
  color: string;
  inputs: Array<{
    name: string;
    type: 'string' | 'number' | 'select' | 'boolean' | 'block';
    options?: string[];
    defaultValue?: any;
  }>;
  isContainer?: boolean;
}

export interface Project {
  id: string;
  name: string;
  blocks: BlockInstance[];
  variables: string[];
}
