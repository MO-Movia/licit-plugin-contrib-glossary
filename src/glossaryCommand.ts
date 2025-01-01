import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import type {PopUpHandle} from '@modusoperandi/licit-ui-commands';
import {
  EditorState,
  NodeSelection,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
}

export interface AcronymItem {
  id: string;
  term: string;
  definition: string;
  description: string;
}

export class GlossaryCommand extends UICommand {
  _popUp: PopUpHandle | null = null;
  _alertPopup: PopUpHandle | null = null;
  _isGlossary = true;
  // eslint-disable-next-line
  runtime: any;
  doNothing: false;
  // eslint-disable-next-line
  constructor(isGlossary?: boolean, runtime?: any) {
    super();
    this._isGlossary = isGlossary ?? true;
    this.runtime = runtime;
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
    const runtime = view?.['runtime'];
    return runtime.glossaryService
      .openManagementDialog({someData: 'value'})
      .then((result) => {
        if (result && !result.doNothing) {
          return this.executeWithUserInput(state, dispatch, view, result);
        }
        return false;
      })
      .catch(() => {
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
        let transaction = this.createGlossaryAcronymNode(
          state,
          item,
          !selection.empty
        );

        // Restore selection if needed
        if (!selection.empty) {
          const newSelection = TextSelection.create(transaction.doc, from, to);
          transaction = transaction.setSelection(newSelection);
        }
        dispatch(transaction);
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
    // eslint-disable-next-line
    const newAttrs: Record<string, any> = {
      id: item.id,
      from: state.selection.from,
      to: state.selection.to,
      term: item.term,
      definition: item.definition,
    };

    // Add description only if the item is an AcronymItem
    if (this.isAcronymItem(item)) {
      newAttrs['description'] = item.description;
    }

    const node = glossaryacronymNode.create(newAttrs);

    if (replace) {
      return state.tr.replaceSelectionWith(node);
    } else {
      return state.tr.insert(state.selection.to, node);
    }
  }
  isAcronymItem(item: GlossaryItem | AcronymItem): item is AcronymItem {
    return (
      typeof (item as AcronymItem).description !== 'undefined' &&
      typeof (item as AcronymItem).description === 'string' &&
      (item as AcronymItem).description.trim().length > 0
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
