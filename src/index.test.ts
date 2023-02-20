import {GlossaryPlugin} from './index';
import {schema, builders} from 'prosemirror-test-builder';
import {EditorState} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';

describe('Glossary Plugin', () => {
  const glossary = {
    from: 5,
    to: 8,
    type: 1,
    term: 'PSP',
    description: 'Pennsylvania State Police',
  };

  const modSchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks,
  });

  const plugin = new GlossaryPlugin();
  const effSchema = plugin.getEffectiveSchema(modSchema);
  plugin.initButtonCommands();
  const {doc, p} = builders(effSchema, {p: {nodeType: 'paragraph'}});

  it('should create glossary', () => {
    const state = EditorState.create({
      doc: doc(p('PSP ', glossary)),
      schema: effSchema,
    });
    expect(state.doc).toBeTruthy();
    const node = state.doc.nodeAt(0);

    if (null != node) {
      expect(node.child(1)).toBe(glossary);
    }
  });
});
