import {AcronymItem, cache, GlossaryItem, GlossaryPlugin} from './index';
import {schema, builders} from 'prosemirror-test-builder';
import {Schema} from 'prosemirror-model';
import {EditorState, TextSelection, Plugin, PluginKey} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {GlossaryCommand} from './glossaryCommand';
import {Transform} from 'prosemirror-transform';
import {createEditor} from 'jest-prosemirror';

class TestPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('TestPlugin'),
    });
  }
}
describe('GlossaryPlugin', () => {
  let plugin: GlossaryPlugin;
  const runtime = {
    glossaryService: {openManagementDialog: () => Promise.resolve(null)},
  };

  beforeEach(() => {
    plugin = new GlossaryPlugin(runtime);
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

  it('should init cache from array', () => {
    const id = 'cacheA';
    expect(cache[id]).toBeUndefined();
    new GlossaryPlugin({
      ...runtime,
      cache: [{id, term: id, definition: id}],
    });
    expect(cache[id]).toBeDefined();
  });
  it('should init cache from promise', async () => {
    const id = 'cacheP';
    expect(cache[id]).toBeUndefined();
    const promise = Promise.resolve([{id, term: id, definition: id}]);
    new GlossaryPlugin({
      ...runtime,
      cache: promise,
    });
    await promise;
    expect(cache[id]).toBeDefined();
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
      const glossaryCmd = new GlossaryCommand(runtime);
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
      glossaryCmd.isEnabled(view.state, view);
      glossaryCmd['isGlossary'] = true;
      const bok = glossaryCmd.executeWithUserInput(
        state,
        // view.dispatch,
        view.dispatch as (tr: Transform) => void,
        view,
        glossaryObj as unknown as GlossaryItem | AcronymItem
      );
      expect(bok).toBeTruthy();
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
      const glossaryCmd = new GlossaryCommand(runtime);
      glossaryCmd.isEnabled(view.state, view);

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
      glossaryCmd.executeWithUserInput(
        state,
        undefined,
        view,
        mockGlossaryObj as unknown as GlossaryItem | AcronymItem
      );
      const bok = glossaryCmd.executeWithUserInput(
        state,
        view.dispatch as (tr: Transform) => void,
        view,
        mockGlossaryObj as unknown as GlossaryItem | AcronymItem
      );
      expect(bok).toBeTruthy();
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
      const glossaryCmd = new GlossaryCommand(runtime);
      const _test = await glossaryCmd.waitForUserInput(
        editor.state,
        undefined,
        view
      );
      expect(_test).toBeFalsy();
    });
    it('should _isEnabled function return false', () => {
      const glossaryCmd = new GlossaryCommand(runtime);
      const modSchema = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks,
      });
      const effSchema = plugin.getEffectiveSchema(modSchema);
      const {doc} = builders(effSchema, {});
      const state = EditorState.create({
        doc: doc(),
      });
      const _test = glossaryCmd.isEnabled(state);
      expect(_test).toBeFalsy();
    });
    it('should call initKeyCommands', () => {
      expect(plugin.initKeyCommands()).toBeDefined();
    });
  });
});
