import {PluginKey} from 'prosemirror-state';
import {cacheInput as CacheInput} from './glossaryView';

export const GLOSSARY_PLUGIN_KEY = new PluginKey('GlossaryPlugin');
export const GLOSSARY = 'glossary';
export const ACRONYM = 'acronym';

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  description?: never; // for safer typing against Acronyms
}

export interface AcronymItem {
  id: string;
  term: string;
  definition: string;
  description: string;
}

export type IndexItem = GlossaryItem | AcronymItem;

export interface GlossaryService {
  openManagementDialog(
    initialSearch: string
  ): Promise<IndexItem | null | undefined>;

  fetchTerm?(id: string): Promise<IndexItem | null | undefined>;
}

export interface GlossaryRuntime {
  glossaryService: GlossaryService;
  cache?: CacheInput;
}
