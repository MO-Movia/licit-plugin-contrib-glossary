import * as React from 'react';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {
  EditorState,
  NodeSelection,
  Transaction,
  TextSelection,
} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {GlossaryListUI} from './glossaryListUI';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import type {PopUpHandle} from '@modusoperandi/licit-ui-commands';
import {AcronymItem, GlossaryItem} from '@mo/maw-smart-document';
import {EditorRuntime} from './types';
import {RuntimeService} from '@mo/blade-editor';
import {GlossaryAcronymManagementComponent} from '@mo/maw-smart-document';

export class GlossaryCommand extends UICommand {
  _popUp: PopUpHandle | null = null;
  _alertPopup: PopUpHandle | null = null;
  _isGlossary = true;
  runtime: EditorRuntime;
  isInEditor?: false;
  bladeruntime?: RuntimeService;
  doNothing: false;
  glossaryAcronym: GlossaryAcronymManagementComponent;

  constructor(
    isGlossary?: boolean,
    runtime?: RuntimeService,
    isInEditor?: boolean
  ) {
    super();
    this._isGlossary = isGlossary ?? true;
    this.bladeruntime = runtime;
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
    let runtime;
    if (typeof this.runtime !== 'undefined') {
      runtime = this.runtime;
    } else {
      runtime = editorView['runtime'];
    }

    return {
      isGlossary: this._isGlossary,
      selectedRowRefID: 1,
      term: editorView.state.selection.empty
        ? ''
        : editorView.state.doc
            .cut(editorView.state.selection.from, editorView.state.selection.to)
            .textContent.trim(),
      mode: 1, // 0 = new, 1 = modify, 2 = delete
      editorView: editorView,
      runtime: runtime,
    };
  }

  waitForUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<boolean> => {
    if (state.selection.empty) {
      return Promise.resolve(false);
    }
    return this.bladeruntime
      .openManagementDialog({someData: 'value'})
      .then((result) => {
        if (result) {
          console.log('Dialog result:', result);
          return this.executeWithUserInput(state, dispatch, view, result);
        }
        return false;
      })
      .catch((error) => {
        console.error('Dialog error:', error);
        return false;
      });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch?: (tr: Transaction) => void | undefined,
    _view?: EditorView | undefined,
    item?: GlossaryItem | AcronymItem
  ): boolean => {
    if (dispatch && item) {
      const {selection} = state;
      const {from, to} = selection;

      // Validate positions
      if (
        from >= 0 &&
        to >= 0 &&
        from < state.doc.content.size &&
        to < state.doc.content.size
      ) {
        const transaction = this.createGlossaryAcronymNode(
          state,
          item,
          !selection.empty
        );
        dispatch(transaction);

        // Restore selection if needed
        if (!selection.empty) {
          const newSelection = TextSelection.create(transaction.doc, from, to);
          dispatch(transaction.setSelection(newSelection));
        }
      }
    }
    return false;
  };

  cancel(): void {
    return null;
  }

  createGlossaryAcronymNode(
    state: EditorState,
    item: GlossaryItem | AcronymItem,
    replace: boolean
  ) {
    const glossaryacronymNode = state.schema.nodes['glossary'];
    const newAttrs = {};
    Object.assign(newAttrs, glossaryacronymNode['attrs']);
    newAttrs['id'] = item.id;
    newAttrs['from'] = state.selection.from;
    newAttrs['to'] = state.selection.to;
    newAttrs['term'] = item.term;
    newAttrs['definition'] = item.definition;
    if (this.isAcronymItem(item)) {
      newAttrs['description'] = item.description;
    }
    const node = glossaryacronymNode.create(newAttrs);
    console.log(newAttrs);
    if (replace) {
      return state.tr.replaceSelectionWith(node);
    } else {
      return state.tr.insert(state.selection.to, node);
    }
  }

  isAcronymItem(item: GlossaryItem | AcronymItem): item is AcronymItem {
    return (
      'description' in item &&
      typeof item.description === 'string' &&
      item.description.trim().length > 0
    );
  }

  deleteGlossaryNode(state: EditorState, term: string): Transaction {
    const node = state.schema.text(term);
    return state.tr.replaceSelectionWith(node);
  }

  _isEnabled = (state: EditorState, view?: EditorView): boolean => {
    return (
      view?.['runtime'] &&
      'image' !== (state.tr.selection as NodeSelection)?.node?.type?.name
    );
  };

  renderLabel() {
    return null;
  }

  isActive(): boolean {
    return true;
  }

  executeCustom(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
}
