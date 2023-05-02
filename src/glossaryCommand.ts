import * as React from 'react';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {EditorState, NodeSelection, Transaction} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import GlossaryListUI from './glossaryListUI';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import type {PopUpHandle} from '@modusoperandi/licit-ui-commands';
import {EditorRuntime} from './types';

export class GlossaryCommand extends UICommand {
  _popUp: PopUpHandle | null = null;
  _alertPopup: PopUpHandle | null = null;
  _isGlossary = true;
  runtime: EditorRuntime;

  constructor(isGlossary?: boolean) {
    super();
    this._isGlossary = isGlossary;
  }

  isEnabled = (state: EditorState, view: EditorView): boolean => {
    return this._isEnabled(state, view);
  };

  getSelectedText(editorView: EditorView) {
    let selectedText = '';
    editorView.state.tr.doc.nodesBetween(
      editorView.state.selection.from,
      editorView.state.selection.to,
      (node, _pos) => {
        if (node) {
          selectedText = node.text;
        }
        return true;
      }
    );
    return selectedText;
  }

  createGlossaryObject(editorView: EditorView) {
    return {
      isGlossary: this._isGlossary,
      selectedRowRefID: 1,
      term: editorView.state.selection.empty
        ? ''
        : editorView.state.doc
            .cut(editorView.state.selection.from, editorView.state.selection.to)
            .textContent.trim(),
      mode: 1, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      runtime: this.runtime,
    };
  }

  waitForUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<unknown> => {
    if (state.selection) {
      const node = state.doc.cut(state.selection.from, state.selection.to);
      if (node && 'glossary' === node.type.name) {
        dispatch(this.deleteGlossaryNode(state, node.attrs['term']));
        return Promise.resolve({doNothing: true});
      }
    }

    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        GlossaryListUI,
        this.createGlossaryObject(view),
        {
          modal: true,
          IsChildDialog: false,
          autoDismiss: false,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: (tr: Transform) => void | undefined,
    _view: EditorView | undefined,
    glossary
  ): boolean => {
    if (dispatch) {
      const {selection} = state;
      if (!glossary.doNothing) {
        if (undefined !== glossary.glossaryObject.id) {
          const transaction = this.createGlossaryNode(
            state,
            glossary,
            !selection.empty
          );
          dispatch(transaction);
        }
      }
    }

    return false;
  };

  createGlossaryNode(state: EditorState, glossary, replace: boolean) {
    const glossarynode = state.schema.nodes['glossary'];
    const newattrs = {};
    Object.assign(newattrs, glossarynode['attrs']);
    newattrs['id'] = glossary.glossaryObject.id;
    newattrs['from'] = state.selection.from;
    newattrs['to'] = state.selection.to;
    newattrs['description'] = glossary.glossaryObject.description;
    newattrs['term'] = glossary.glossaryObject.term;
    newattrs['type'] = this._isGlossary ? 1 : 2;
    const node = state.schema.nodes.glossary.create(newattrs);
    if (replace) {
      return state.tr.replaceSelectionWith(node);
    } else {
      return state.tr.insert(state.selection.to, node);
    }
  }

  deleteGlossaryNode(state: EditorState, term: string): Transaction {
    const node = state.schema.text(term);
    return state.tr.replaceSelectionWith(node);
  }

  _isEnabled = (state: EditorState, view: EditorView): boolean => {
    if (!view) {
      return false;
    }

    this.runtime = view['runtime'];
    if (!this.runtime) {
      return false;
    }

    const tr = state.tr;
    const {selection} = tr;
    if (
      selection &&
      (selection as NodeSelection).node &&
      'image' === (selection as NodeSelection).node.type.name
    ) {
      return false;
    }
    return true;
  };
}
