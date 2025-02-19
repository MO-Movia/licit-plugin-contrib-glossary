import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {AcronymItem, GlossaryItem, GlossaryRuntime, IndexItem} from './types';
import {GLOSSARY} from './types';

export class GlossaryCommand extends UICommand {
  constructor(private runtime: GlossaryRuntime) {
    super();
  }

  isEnabled = (state: EditorState, _view?: EditorView): boolean => {
    return this.executeWithUserInput(state, null, _view, {} as IndexItem);
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

  waitForUserInput = (
    state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): Promise<IndexItem | null | undefined> => {
    return this.runtime?.glossaryService
      .openManagementDialog(
        state.doc.cut(state.selection.from, state.selection.to).textContent
      )
      .catch((e) => {
        console.error(e);
        return null;
      });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch?: (tr: Transaction) => void | undefined,
    _view?: EditorView | undefined,
    item?: IndexItem
  ): boolean => {
    if (!item) {
      return false;
    }
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
      dispatch?.(transaction);
      return true;
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
    const glossaryacronymNode = state.schema.nodes[GLOSSARY];

    const node = glossaryacronymNode.create({
      id: item.id,
      from: state.selection.from,
      to: state.selection.to,
      term: item.term,
      definition: item.definition,
      description: item.description,
    });

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
