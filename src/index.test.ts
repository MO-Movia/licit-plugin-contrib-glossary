import {GlossaryPlugin} from './index';
import {schema, builders} from 'prosemirror-test-builder';
import {Schema} from 'prosemirror-model';
import {EditorState, TextSelection, Plugin, PluginKey} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {GlossaryView} from './glossaryView';
import {GlossaryCommand} from './glossaryCommand';
import {Transform} from 'prosemirror-transform';
import {createEditor} from 'jest-prosemirror';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import {GlossaryListUI} from './glossaryListUI';
import {EditorRuntime} from './types';

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
        marks: schema.spec.marks,
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
        {mount: dom},
        {
          state: state,
        }
      );
      const node = view.state.doc.nodeAt(6);
      if (node == null) {
        expect(node).not.toBeNull();
        return;
      }
      const gView = new GlossaryView(node, view, () => undefined);
      expect(gView.createGlossaryObject(view, 1)).toBeDefined();
    });
  });
  describe('initKeyCommands', () => {
    it('should executeWithUserInput', () => {
      const modSchema = new Schema({
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
      const plugin = new GlossaryPlugin();
      const effSchema = plugin.getEffectiveSchema(modSchema);
      const {doc, p} = builders(effSchema, {p: {nodeType: 'paragraph'}});

      const state = EditorState.create({
        doc: doc(p(glossary)),
        schema: effSchema,
      });
      const dom = document.createElement('div');
      document.body.appendChild(dom);
      // Set up our document body
      document.body.innerHTML = '<div></div>';
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
      const glossaryObj = {
        glossaryObject: {
          from: 0,
          to: 9,
          type: 1,
          id: 1,
          description: 'Test description',
          term: 'term',
        },
      };
      glossaryCmd.createGlossaryNode(view.state, glossaryObj, false);
      glossaryCmd.createGlossaryNode(view.state, glossaryObj, true);
      glossaryCmd._isEnabled(view.state, view);
      glossaryCmd._isGlossary = true;
      const bok = glossaryCmd.executeWithUserInput(
        state,
        // view.dispatch,
        view.dispatch as (tr: Transform) => void,
        view,
        glossaryObj
      );
      expect(bok).toBeFalsy();
    });
    it('should executeWithUserInput', () => {
      const modSchema = new Schema({
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
      const plugin = new GlossaryPlugin();
      const effSchema = plugin.getEffectiveSchema(modSchema);
      const {doc, p} = builders(effSchema, {p: {nodeType: 'paragraph'}});

      const state = EditorState.create({
        doc: doc(p(glossary)),
        schema: effSchema,
      });
      const dom = document.createElement('div');
      document.body.appendChild(dom);
      // Set up our document body
      document.body.innerHTML = '<div></div>';
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
      const glossaryObj = {
        glossaryObject: {
          from: 0,
          to: 9,
          type: 1,
          id: 1,
          description: 'Test description',
          term: 'term',
        },
      };
      glossaryCmd.createGlossaryNode(view.state, glossaryObj, false);
      glossaryCmd.createGlossaryNode(view.state, glossaryObj, true);
      glossaryCmd._isEnabled(view.state, view);

      const mockGlossaryObj = {
        doNothing: true,
        glossaryObject: {
          from: 0,
          to: 9,
          type: 1,
          id: 1,
          description: 'Test description',
          term: 'term',
        },
      };
      glossaryCmd.executeWithUserInput(state, undefined, view, mockGlossaryObj);
      const bok = glossaryCmd.executeWithUserInput(
        state,
        view.dispatch as (tr: Transform) => void,
        view,
        mockGlossaryObj
      );
      expect(bok).toBeFalsy();
    });
    it('should Wait For User Input', async () => {
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
      const editor = createEditor(doc('<cursor>', p('Hello')));
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
      const _test = await glossaryCmd.waitForUserInput(
        editor.state,
        undefined,
        view
      );
      expect(_test).toBeUndefined();
    });
    it('should _isEnabled function return false', () => {
      const glossaryCmd = new GlossaryCommand();
      const _state = {} as unknown as EditorState;
      const _view = undefined as unknown as EditorView;
      const _test = glossaryCmd.isEnabled(_state, _view);
      expect(_test).toBeFalsy();
    });
    it('should call initKeyCommands', () => {
      expect(plugin.initKeyCommands()).toBeDefined();
    });
  });
});
