import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState, NodeSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import GlossaryListUI from './GlossaryListUI';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import type { PopUpHandle } from '@modusoperandi/licit-ui-commands';
import { Fragment } from 'prosemirror-model';
import GlossaryRuntime from './glossaryRuntime';


export class GlossaryCommand extends UICommand {
  _popUp: PopUpHandle | null = null;
  _alertPopup: PopUpHandle | null = null;
  _isGlossary = true;

  constructor(isGlossary?: boolean) {
    super();
    this._isGlossary = isGlossary;
  }
  isEnabled = (state: EditorState): boolean => {
    return this._isEnabled(state);
  };

  getSelectedText(editorView: EditorView) {
    let selectedText = '';
    editorView.state.tr.doc.nodesBetween(editorView.state.selection.from, editorView.state.selection.to, (node, _pos) => {
      if (node) {
        selectedText = node.text;
      }
      return true;
    });
    return selectedText;
  }

  getGlossaryObject(term: string): number {
    let glossaryObj = null;
    const runtime = new GlossaryRuntime();
    if (this._isGlossary && typeof runtime.getGlossary(term) === 'function') {
      runtime.getGlossary(term).then((result) => {
        if (result.length === 1) {
          glossaryObj = result;
        }
      });
    }
    else if (!this._isGlossary && typeof runtime.getAcronyms(term) === 'function') {
      runtime.getAcronyms(term).then((result) => {
        if (result.length === 1) {
          glossaryObj = result;
        }
      });
    }
    return glossaryObj;
  }

  createGlossaryObject(
    editorView: EditorView
  ) {
    return {
      isGlossary: this._isGlossary,
      selectedRowRefID: 1,
      term: editorView.state.selection.empty ? '' : editorView.state.doc.cut(editorView.state.selection.from, editorView.state.selection.to).textContent.trim(),
      mode: 1, //0 = new , 1- modify, 2- delete
      editorView: editorView,
    };
  }
  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<unknown> => {
    // let glossary = this.getGlossaryObject(view.state.doc.cut(view.state.selection.from, view.state.selection.to).textContent);
    // if (null !== glossary) {
    //   const transaction = this.createGlossaryNode(_state, glossary);
    //   _dispatch(transaction);

    //   return Promise.resolve(undefined);
    // }
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
      const { selection } = state;
      let { tr } = state;
      if (undefined !== glossary.glosarryObject.id) {
        if (selection.empty) {
          const textNode = state.schema.nodes.glossary.create(glossary.glosarryObject.term);
          const newAttrs = {};
          Object.assign(newAttrs, textNode['attrs']);
          newAttrs['id'] = glossary.glosarryObject.id;
          newAttrs['from'] = state.selection.from;
          newAttrs['to'] = state.selection.to;
          newAttrs['description'] = glossary.glosarryObject.description;
          newAttrs['term'] = glossary.glosarryObject.term;
          newAttrs['type'] = this._isGlossary ? 1 : 2;
          tr = tr.insert(
            state.selection.to,
            Fragment.from(textNode),
          );

          tr = tr.setNodeMarkup(
            state.selection.from,
            undefined,
            newAttrs
          );
          dispatch(tr);
        }
        else {
          const transaction = this.createGlossaryNode(state, glossary);
          dispatch(transaction);
        }
      }
    }

    return false;
  };

  createGlossaryNode(state, glossary) {
    const glossarynode = state.schema.nodes['glossary'];
    const newattrs = {};
    Object.assign(newattrs, glossarynode['attrs']);
    newattrs['id'] = glossary.glosarryObject.id;
    newattrs['from'] = state.selection.from;
    newattrs['to'] = state.selection.to;
    newattrs['description'] = glossary.glosarryObject.description;
    newattrs['term'] = glossary.glosarryObject.term;
    newattrs['type'] = this._isGlossary ? 1 : 2;
    const selection = state.doc.cut(state.selection.from, state.selection.to);
    const node = state.schema.nodes.glossary.create(newattrs, selection);
    const transaction = state.tr.replaceSelectionWith(node);
    return transaction;
  }

  _isEnabled = (state: EditorState): boolean => {
    const tr = state.tr;
    const { selection } = tr;
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

