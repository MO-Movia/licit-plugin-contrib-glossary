/* eslint-disable */

import {GlossaryPlugin} from './index';
import {schema, builders} from 'prosemirror-test-builder';
import {Plugin, PluginKey, EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Node, Schema} from 'prosemirror-model';
import {GlossaryView} from './glossaryView';
import {GlossaryCommand} from './glossaryCommand';
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

describe('Glossary Plugin Extended', () => {
  let gView;
  beforeEach(() => {
    const before = 'hello';
    const after = ' world';

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
    gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
  });
  const glossary = {
    from: 0,
    to: 9,
    type: 1,
    id: 1,
    description: 'Test description',
    term: 'term',
  };

  const mySchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks,
  });
  const plugin = new GlossaryPlugin();
  const effSchema = plugin.getEffectiveSchema(mySchema);

  const newGlossaryNode = effSchema.node(effSchema.nodes.glossary, glossary);
  plugin.initButtonCommands();
  const {doc, p} = builders(mySchema, {p: {nodeType: 'paragraph'}});


  it('should return position when posAtCoords returns a valid position', () => {
    const mockPos = { pos: 42 , inside: 32};
    const before = 'hello';
    const after = ' world';
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
    const gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    jest.spyOn(gView.outerView, 'posAtCoords').mockReturnValue(mockPos);

    const result = gView.getNodePosEx(100, 200);

    expect(gView.outerView.posAtCoords).toHaveBeenCalledWith({ left: 100, top: 200 });
    expect(result).toBe(42);
  });


  it('should return null when posAtCoords returns null', () => {
    const before = 'hello';
    const after = ' world';
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
    const gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    jest.spyOn(gView.outerView, 'posAtCoords').mockReturnValue(null);
    const result = gView.getNodePosEx(100, 200);
    expect(gView.outerView.posAtCoords).toHaveBeenCalledWith({ left: 100, top: 200 });
    expect(result).toBeNull();
  });

  it('showSourceText should call', () => {
    const mockEvent = new MouseEvent('click');
    const before = 'hello';
    const after = ' world';

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
    const gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const mockOpen = jest.spyOn(gView, 'open');
    gView.showSourceText(mockEvent);
    (gView.node.attrs as Record<string, boolean>).term = false;
    gView.deleteGlossaryNode(view);
    expect(mockOpen).toHaveBeenCalledWith(mockEvent);
  });

  it('hideSourceText returns null', () => {
    const clickEvent = new MouseEvent('mouseclick', {
      clientX: 281,
      clientY: 125,
    });
    gView.hideSourceText(clickEvent);
    const closeMock = jest.fn();
    const mockMouseEvent = new MouseEvent('click');
    const mockThis = {close: closeMock};

    gView.hideSourceText.call(mockThis, mockMouseEvent);

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
  it('GlossaryView call createGlossaryTooltip ', () => {
    const before = 'hello';
    const after = ' world';

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
    const cView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const ttContent = document.createElement('div');
    ttContent.id = 'tooltip-content';
    ttContent.innerHTML =
      '"<p>test <a href="ingo" title="ingo">ingo</a> icon</p>"';
    const errorinfodiv = document.createElement('div');
    errorinfodiv.className = 'ProseMirror czi-prosemirror-editor';
    const tooltip = document.createElement('div');
    tooltip.className = 'molcit-glossary-tooltip';
    document.body.appendChild(tooltip);
    cView.outerView.dom.className = 'molcit-glossary-tooltip';
    const clickEvent = new MouseEvent('mouseclick', {
      clientX: 976,
      clientY: 125,
    });
    const clickEvent2 = new MouseEvent('mouseclick', {
      clientX: 280,
      clientY: 125,
    });
    cView.setContentRight(clickEvent2, errorinfodiv, tooltip, ttContent);
    const getNodePosEx = jest.spyOn(cView, 'getNodePosEx');
    getNodePosEx.mockReturnValue(12);
    // Call the close function
    cView.close();
    expect(
      cView.setContentRight(clickEvent, errorinfodiv, tooltip, ttContent)
    ).toBeUndefined();
  });
  it('GlossaryView call selectNode', () => {
    const before = 'hello';
    const after = ' world';

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
    const cView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const getNodePosEx = jest.spyOn(cView, 'getNodePosEx');
    getNodePosEx.mockReturnValue(12);
    const targetElement = document.createElement('div');
    targetElement.className = 'fa';
    const mockEvent = {
      currentTarget: document.createElement('div'),
    } as unknown as MouseEvent;
    const event = new MouseEvent('mouseclick', {
      clientX: 281,
      clientY: 125,
    });
    targetElement.dispatchEvent(event);
    const glossaryCmd = new GlossaryCommand();
    glossaryCmd.runtime = '' as EditorRuntime;
    gView._popUp_subMenu = createPopUp(
      GlossaryListUI,
      glossaryCmd.createGlossaryObject(view),
      {
        modal: true,
        IsChildDialog: false,
        autoDismiss: false,
      }
    );
    cView._popUp;
    cView.selectNode(mockEvent);
    gView.runtime = {} as EditorRuntime;
    gView.onEditGlossary(view);
    cView.selectNode(event as MouseEvent);
  });
  it('selectNode should call', () => {
    const before = 'hello';
    const after = ' world';

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
    const cView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const targetElement = document.createElement('div');
    const clickEvent = new MouseEvent('mouseclick', {
      clientX: 281,
      clientY: 125,
    });
    targetElement.dispatchEvent(clickEvent);
    cView.selectNode(clickEvent);
    cView.selectNode(undefined as any);
  });
  it('removeEventListenerToView should call', () => {
    const before = 'hello';
    const after = ' world';

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
    const gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const mock = jest.spyOn(gView, 'removeEventListenerToView');
    gView.destroy();
    expect(mock).toHaveBeenCalled();
  });
  it('updateGlossaryDetails should call ', () => {
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
    gView.updateGlossaryDetails({}, glossaryObj);
    gView.updateGlossaryDetails(view, glossaryObj);
  });

  it('_onClose should call', () => {
    gView._onClose();
    expect(gView._popUp_subMenu).toBe(null);
  });
  it('_onClose should call', () => {
    const before = 'hello';
    const after = ' world';

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
    gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const glossaryCmd = new GlossaryCommand();
    glossaryCmd.runtime = '' as EditorRuntime;

    gView._popUp_subMenu = createPopUp(
      GlossaryListUI,
      glossaryCmd.createGlossaryObject(view),
      {
        modal: true,
        IsChildDialog: false,
        autoDismiss: false,
      }
    );
    gView._popUp = createPopUp(
      GlossaryListUI,
      glossaryCmd.createGlossaryObject(view),
      {
        modal: true,
        IsChildDialog: false,
        autoDismiss: false,
      }
    );
    gView.destroyPopup();
  });
  it('getNodeType should call', () => {
    const before = 'hello';
    const after = ' world';
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
    gView.getNameAfter(view.state);
    const nodeRes = gView.getNodeType(state);

    expect(nodeRes).not.toBe(null);
  });

  it('update should return true',()=> {
    const before = 'hello';
    const after = ' world';

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
    const gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
  
    gView.node.sameMarkup(gView.node);
    expect(gView.update(gView.node)).toBe(true);
  });

  it('should return false when node markup is the same', () => {
    const before = 'hello';
    const after = ' world';

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
    gView = new GlossaryView(
      view.state.doc.nodeAt(6) as Node,
      view,
      undefined as any
    );
    const node = view.state.doc.nodeAt(0) as Node;
    expect(gView.update(node)).toBe(false);
  });

  it('stopEvent should return false', () => {
    expect(gView.stopEvent()).toBe(false);
  });

  it('ignoreMutation should return true', () => {
    gView.onGlossarySubMenuMouseOut();
    expect(gView.ignoreMutation()).toBe(true);
  });
});
