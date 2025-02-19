import {DOMOutputSpec, Node, NodeSpec} from 'prosemirror-model';
import {GLOSSARY} from './types';

export const GlossaryNodeSpec: NodeSpec = {
  group: 'inline',
  content: 'text*',
  inline: true,
  selectable: true,
  // added new attributes to this spec.
  attrs: {
    from: {default: null},
    to: {default: null},
    type: {default: 1},
    term: {default: null},
    description: {default: null},
    definition: {default: null},
    id: {default: null},
  },
  toDOM,
  parseDOM: [
    {
      tag: GLOSSARY,
      getAttrs,
    },
  ],
};

function getAttrs(dom: HTMLElement): Record<string, unknown> {
  const from = dom.getAttribute('from') || null;
  const to = dom.getAttribute('to') || null;
  const type = dom.getAttribute('type') || null;

  const description = dom.getAttribute('description') || null;
  const definition = dom.getAttribute('definition') || null;
  const term = dom.getAttribute('term') || null;
  const id = dom.getAttribute('id') || null;

  return {
    from,
    to,
    type,
    description,
    definition,
    term,
    id,
  };
}

function toDOM(node: Node): DOMOutputSpec {
  const {from, to, type, description, definition, term, id} = node.attrs;
  const attrs = {
    from,
    to,
    type,
    description,
    definition,
    term,
    id,
  };
  attrs.from = from;
  attrs.to = to;
  attrs.type = type;
  attrs.description = description;
  attrs.definition = definition;
  attrs.term = term;
  attrs.id = id;

  return [GLOSSARY, attrs];
}
