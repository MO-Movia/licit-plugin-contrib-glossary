import { GlossaryPlugin } from './index';
import { schema, builders } from 'prosemirror-test-builder';
import { Schema } from 'prosemirror-model';
import { EditorState, TextSelection, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import GlossaryView from './glossaryView';
import { GlossaryCommand } from './glossaryCommand';
import { Transform } from 'prosemirror-transform';

class TestPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('TestPlugin'),
    });
  }
}
describe('GlossaryPlugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new GlossaryPlugin();
  });

  describe('getEffectiveSchema', () => {
    it('should add a glossary node to the schema', () => {
      const mySchema = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks
      });
      const effSchema = plugin.getEffectiveSchema(mySchema);
      plugin.initButtonCommands();
      expect(effSchema.spec.nodes).toBeDefined();
    });
  });
  describe('GlossaryPlugin', () => {
    it('should initialize the nodeViews property with the GLOSSARY node type', () => {
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
      document.body.appendChild(dom);
      const view = new EditorView(
        { mount: dom },
        {
          state: state,
        }
      );
      new GlossaryView(
        view.state.doc.nodeAt(6),
        view,
        undefined as any
      );
    });
  });
  describe('initKeyCommands', () => {
    it('should executeWithUserInput', () => {
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
      document.body.appendChild(dom);
      const view = new EditorView(
        { mount: dom },
        {
          state: state,
        }
      );
      document.body.appendChild(dom);
      // Set up our document body
      document.body.innerHTML = '<div></div>';
      const selection = TextSelection.create(view.state.doc, 1, 2);
      const tr = view.state.tr.setSelection(selection);
      view.updateState(
        view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
      );

  
      const addInfoIconcmd = new GlossaryCommand();
      addInfoIconcmd.createGlossaryObject(view)
      addInfoIconcmd.createGlossaryNode(state, [{ isGlossary: true, mode: 1, selectedRowRefID: "1", glossaryObject: { id: '3', term: 'CAS', description: 'Close Air Support' } }], false);
      view.dispatch(tr);
      const getFragm = document.createElement('div');
      getFragm.innerHTML = '<p>Test Doc</p>';
      const bok = addInfoIconcmd.executeWithUserInput(
        state,
        // view.dispatch,
        view.dispatch as (tr: Transform) => void,
        view,
        glossary as any
      );
      expect(bok).toBeFalsy();
    });

    it('should call initKeyCommands', () => {
      expect(plugin.initKeyCommands());
    });
  });
});