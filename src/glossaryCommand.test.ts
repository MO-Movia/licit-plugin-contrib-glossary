import {GlossaryCommand} from './glossaryCommand';
import {GlossaryPlugin} from './index';
import {schema, builders} from 'prosemirror-test-builder';
import {Plugin, PluginKey, EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import {EditorRuntime} from './types';
import {GlossaryListUI} from './glossaryListUI';
import {Transform} from 'prosemirror-transform';

class TestPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('TestPlugin'),
    });
  }
}
describe('GlossaryPlugin', () => {
  let plugin: GlossaryPlugin;

  beforeEach(() => {
    plugin = new GlossaryPlugin();
  });
  it('should Wait For User Input', () => {
    const modSchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    const glossaryObj = {
      from: 0,
      to: 9,
      type: 1,
      id: 1,
      description: 'Test description',
      term: 'term',
    };

    const plugin = new GlossaryPlugin();
    const effSchema = plugin.getEffectiveSchema(modSchema);
    const {doc, p} = builders(effSchema, {p: {nodeType: 'paragraph'}});
    const state = EditorState.create({
      doc: doc(p(glossaryObj)),
      schema: effSchema,
    });

    const dom = document.createElement('div');
    document.body.appendChild(dom);
    const view = new EditorView(
      {mount: dom},
      {
        state: state,
      }
    );
    const selection = TextSelection.create(view.state.doc, 1, 2);
    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({plugins: [plugin, new TestPlugin()]})
    );
    view.dispatch(tr);
    const glossaryCmd = new GlossaryCommand();
    glossaryCmd.runtime = '' as EditorRuntime;
    glossaryCmd._popUp = createPopUp(
      GlossaryListUI,
      glossaryCmd.createGlossaryObject(view),
      {
        modal: true,
        IsChildDialog: false,
        autoDismiss: false,
      }
    );
    glossaryCmd._isGlossary = false;
    expect(glossaryCmd.deleteGlossaryNode(view.state, 'term')).toBeDefined();
  });
  it('getSelectedText() returns the selected text in the editor view', () => {
    const before = 'hello';
    const after = ' world';
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    const glossary = {
      from: 0,
      to: 9,
      type: 1,
      id: 1,
      description: 'Test description',
      term: 'term',
    };
    const {doc, p} = builders(mySchema, {p: {nodeType: 'paragraph'}});
    const effSchema = plugin.getEffectiveSchema(mySchema);
    const newGlossaryNode = effSchema.node(effSchema.nodes.glossary, glossary);
    const state = EditorState.create({
      doc: doc(p(before, newGlossaryNode, after)),
      schema: effSchema,
      plugins: [plugin],
    });
    const dom = document.createElement('div');
    const view = new EditorView(
      {mount: dom},
      {
        state: state,
      }
    );
    const gm = new GlossaryCommand();
    const selection = TextSelection.create(view.state.doc, 1, 2);
    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({plugins: [plugin, new TestPlugin()]})
    );
    view.dispatch(tr);
    const selectedText = gm.getSelectedText(view);
    gm.isEnabled(state, view);
    gm.createGlossaryObject(view);
    expect(selectedText).toBe('hello');
  });

  it('should render label', () => {
    const gm = new GlossaryCommand();
    expect(gm.renderLabel()).toBeNull();
  });

  it('should be active', () => {
    const gm = new GlossaryCommand();
    expect(gm.isActive()).toBeTruthy();
  });

  it('should execute custom', () => {
    const gm = new GlossaryCommand();
    const mockState = {} as unknown as EditorState;
    const mockTr = {} as unknown as Transform;
    expect(gm.executeCustom(mockState, mockTr)).toBe(mockTr);
  });
});
