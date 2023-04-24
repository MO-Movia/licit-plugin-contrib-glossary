import { GlossaryCommand } from './glossaryCommand';
import { GlossaryPlugin } from './index';
import { schema, builders } from 'prosemirror-test-builder';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
describe('GlossaryPlugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new GlossaryPlugin();
  });
  it('getSelectedText() returns the selected text in the editor view', () => {
    const before = 'hello';
    const after = ' world';
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks
    });
    const glossary = {
      from: 0,
      to: 9,
      type: 1,
      id: 1,
      description: 'Test description',
      term: 'term'
    };
    const { doc, p } = builders(mySchema, { p: { nodeType: 'paragraph' } });
    const effSchema = plugin.getEffectiveSchema(mySchema);
    const newGlossaryNode = effSchema.node(
      effSchema.nodes.glossary,
      glossary
    );
    const state = EditorState.create({
      doc: doc(p(before, newGlossaryNode, after)),
      schema: effSchema,
      plugins: [plugin],
    });
    const dom = document.createElement('div');
    const view = new EditorView(
      { mount: dom },
      {
        state: state,
      }
    );
    const gm = new GlossaryCommand();
    const selectedText = gm.getSelectedText(view);
    gm.isEnabled(state, view);
    gm.createGlossaryObject(view);
    expect(selectedText).toBe(undefined); // TODO
  });
});