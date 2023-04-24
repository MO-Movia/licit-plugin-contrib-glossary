/* eslint-disable */

import { GlossaryPlugin } from './index';
import { schema, builders } from 'prosemirror-test-builder';
import { Plugin, PluginKey, EditorState, TextSelection } from 'prosemirror-state';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorView } from 'prosemirror-view';
import {
    Schema,
    MarkType,
} from 'prosemirror-model';
import GlossaryView from './glossaryView';
import { GlossaryCommand } from './glossaryCommand';
import { node } from 'webpack';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import GlossaryListUI from './GlossaryListUI';


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
            { mount: dom },
            {
                state: state,
            }
        );
        gView = new GlossaryView(view.state.doc.nodeAt(6),
            view,
            undefined as any);
    });
    const glossary = {
        from: 0,
        to: 9,
        type: 1,
        id: 1,
        description: 'Test description',
        term: 'term'
    }

    const mySchema = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks
    });
    const plugin = new GlossaryPlugin();
    const effSchema = plugin.getEffectiveSchema(mySchema);

    const newGlossaryNode = effSchema.node(
        effSchema.nodes.glossary,
        glossary
    );
    plugin.initButtonCommands();
    const { doc, p } = builders(mySchema, { p: { nodeType: 'paragraph' } });

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
            { mount: dom },
            {
                state: state,
            }
        );
        const gView = new GlossaryView(view.state.doc.nodeAt(6),
            view,
            undefined as any);
        const mockOpen = jest.spyOn(gView, 'open');
        gView.showSourceText(mockEvent);

        gView.onCancel(view);
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
        const mockThis = { close: closeMock };

        gView.hideSourceText.call(mockThis, mockMouseEvent);

        expect(closeMock).toHaveBeenCalledTimes(1);
    });


    it('GlossaryView update obj ', () => {
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
            { mount: dom },
            {
                state: state,
            }
        );
        const cView = new GlossaryView(
            view.state.doc.nodeAt(6),
            view,
            undefined as any
        );
        const ttContent = document.createElement('div');
        ttContent.id = 'tooltip-content';
        ttContent.innerHTML = '"<p>test <a href="ingo" title="ingo">ingo</a> icon</p>"';
        const errorinfodiv = document.createElement('div');
        errorinfodiv.className = 'ProseMirror czi-prosemirror-editor';
        const tooltip = document.createElement('div');;
        tooltip.className = 'molcit-glossary-tooltip';
        document.body.appendChild(tooltip);
        cView.outerView.dom.className = 'molcit-glossary-tooltip';
        cView.close();
        cView.updateGlossaryDetails(view, {
            glossaryObject: { id: '3', term: 'CAS', description: 'Close Air Support' }
        });

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
            { mount: dom },
            {
                state: state,
            }
        );
        const cView = new GlossaryView(
            view.state.doc.nodeAt(6),
            view,
            undefined as any
        );
        const ttContent = document.createElement('div');
        ttContent.id = 'tooltip-content';
        ttContent.innerHTML = '"<p>test <a href="ingo" title="ingo">ingo</a> icon</p>"';
        const errorinfodiv = document.createElement('div');
        errorinfodiv.className = 'ProseMirror czi-prosemirror-editor';
        const tooltip = document.createElement('div');;
        tooltip.className = 'molcit-glossary-tooltip';
        document.body.appendChild(tooltip);
        cView.outerView.dom.className = 'molcit-glossary-tooltip';
        const clickEvent = new MouseEvent('mouseclick', {
            clientX: 281,
            clientY: 125,
        });
        const getNodePosEx = jest.spyOn(cView, 'getNodePosEx');
        getNodePosEx.mockReturnValue(12);
        // Call the close function
        cView.close();
        cView.setContentRight(clickEvent, errorinfodiv, tooltip, ttContent);

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
            { mount: dom },
            {
                state: state,
            }
        );
        const cView = new GlossaryView(
            view.state.doc.nodeAt(6),
            view,
            undefined as any
        );
        const getNodePosEx = jest.spyOn(cView, 'getNodePosEx');
        getNodePosEx.mockReturnValue(12);
        const targetElement = document.createElement('div');
        targetElement.className = 'fa'
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            currentTarget: targetElement,
            target: targetElement,
        });
        targetElement.dispatchEvent(event);
        const clickEvent = new MouseEvent('mouseclick', {
            clientX: 281,
            clientY: 125,
        });
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
            { mount: dom },
            {
                state: state,
            }
        );
        const cView = new GlossaryView(
            view.state.doc.nodeAt(6),
            view,
            undefined as any
        );
        const targetElement = document.createElement('div');
        const clickEvent = new MouseEvent('mouseclick', {
            clientX: 281,
            clientY: 125
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
            { mount: dom },
            {
                state: state,
            }
        );
        const gView = new GlossaryView(view.state.doc.nodeAt(6),
            view,
            undefined as any);
        const mock = jest.spyOn(gView, 'removeEventListenerToView');
        gView.destroy();
        expect(mock).toHaveBeenCalled();
    });

    it('_onClose should call', () => {
        gView._onClose();
        expect(gView._popUp_subMenu).toBe(null)
    });

    xit('onCancel should call', () => {
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
            { mount: dom },
            {
                state: state,
            }
        );
        const gView = new GlossaryView(view.state.doc.nodeAt(6),
            view,
            undefined as any);
        gView._popUp = createPopUp(
            GlossaryListUI,
            gView.createGlossaryObject(view, 1),
            {
                modal: true,
                IsChildDialog: false,
                autoDismiss: false,
            }
        );
        gView.onCancel(view);
        const mock = jest.spyOn(gView, 'destroyPopup');
        expect(mock).toHaveBeenCalledTimes(0);
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
            { mount: dom },
            {
                state: state,
            }
        );
        gView.getNameAfter(view.state);
        const nodeRes = gView.getNodeType(state);

        expect(nodeRes).not.toBe(null)
    });

    it('stopEvent should return false', () => {
        expect(gView.stopEvent()).toBe(false)
    });

    it('ignoreMutation should return true', () => {
        gView.onGlossarySubMenuMouseOut();
        expect(gView.ignoreMutation()).toBe(true)
    });
});

