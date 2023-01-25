import { DOMOutputSpec, Node, NodeSpec } from 'prosemirror-model';

const GlossaryNodeSpec: NodeSpec = {
  group: 'inline',
  content: 'text*',
  inline: true,
  selectable: false,
  // added new attributes to this spec.
  attrs: {
    from: { default: null },
    to: { default: null },
    type: { default: 1 },
    term: { default: null },
    description: { default: null },
    id: { default: null },
  },
  toDOM,
  parseDOM: [
    {
      tag: 'glossary',
      getAttrs,
    },
  ],
};

function getAttrs(dom: HTMLElement): Record<string, unknown> {
  const from = dom.getAttribute('from') || null;
  const to = dom.getAttribute('to') || null;
  const type = dom.getAttribute('type') || null;

  const description = dom.getAttribute('description') || null;
  const term = dom.getAttribute('term') || null;
  const id = dom.getAttribute('id') || null;

  return {
    from,
    to,
    type,
    description,
    term,
    id
  };
}

function toDOM(node: Node): DOMOutputSpec {
  const { from, to, type, description,
    term, id
  } = node.attrs;
  const attrs = {
    from,
    to,
    type,
    description,
    term,
    id
  };
  attrs.from = from;
  attrs.to = to;
  attrs.type = type;
  attrs.description = description;
  attrs.term = term;
  attrs.id = id;

  return ['glossary', attrs, 0];
}
export default GlossaryNodeSpec;
