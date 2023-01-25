export type NodeSpec = {
  attrs?: { [key: string]: unknown };
  content?: string;
  draggable?: boolean;
  group?: string;
  inline?: boolean;
  name?: string;
  parseDOM?: Array<unknown>;
  toDOM?: (node) => Array<unknown>;
  selectable: boolean;
};
export type MarkSpec = {
  attrs?: { [key: string]: unknown };
  name?: string;
  parseDOM: Array<unknown>;
  toDOM: (node) => Array<unknown>;
};

export type Glossary = {
  id: string;
  term: string;
  description: string;
};

export type EditorRuntime = {
  getAcronyms?: (abbreviation: string) => Promise<Glossary[]>,
  getGlossary?: (term: string) => Promise<Glossary[]>,
};
