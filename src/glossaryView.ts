import {
  atAnchorTopCenter,
  createPopUp,
  PopUpHandle,
} from '@modusoperandi/licit-ui-commands';
import { DOMSerializer, Node } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { AcronymItem, GlossaryItem } from './glossaryCommand';
import { GlossarySubMenu } from './glossarySubMenu';

type CBFn = () => void;
const GLOSSARY = 'glossary';

export type Style = {
  styles?: {
    underline?;
    textHighlight?: string;
  };
};

export class GlossaryView {
  node: Node = null;
  outerView: EditorView = null;
  getPos = null;
  _popUp: PopUpHandle | null = null;
  _popUp_subMenu: PopUpHandle | null = null;
  dom: globalThis.Node = null;
  offsetLeft: Element;
  // eslint-disable-next-line
  runtime: any;
  item: GlossaryItem | AcronymItem;
  constructor(
    node: Node,
    view: EditorView,
    getPos: CBFn,
    // eslint-disable-next-line
    runtime?: any
  ) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.runtime = runtime;
    this.getPos = getPos;
    const spec = DOMSerializer.renderSpec(
      view.dom.ownerDocument,
      this.node.type.spec.toDOM(this.node)
    );
    this.dom = spec.dom;
    (this.dom as Element).className = GLOSSARY;

    this.addEventListenerToView();
    this.addGlossaryContent();
  }

  showSourceText(e: MouseEvent): void {
    if ((this.dom as Element).classList) {
      this.open(e);
    }
  }

  getNodePosEx(left: number, top: number): number {
    const objPos = this.outerView.posAtCoords({left, top});
    return objPos ? objPos.pos : null;
  }

  addEventListenerToView(): void {
    this.dom.addEventListener('mouseover', this.showSourceText.bind(this));
    this.dom.addEventListener('mouseout', this.hideSourceText.bind(this));
    this.dom.addEventListener('click', this.selectNode.bind(this));
  }
  removeEventListenerToView(): void {
    this.dom.removeEventListener('mouseover', this.showSourceText.bind(this));
    this.dom.removeEventListener('mouseout', this.hideSourceText.bind(this));
    this.dom.removeEventListener('click', this.selectNode.bind(this));
  }

  hideSourceText(_e: MouseEvent): void {
    this.close();
  }

  selectNode(e: MouseEvent): void {
    if (undefined === e) {
      return;
    }
    let anchorEl = this.dom;
    if (e?.currentTarget) {
      anchorEl = e.currentTarget as globalThis.Node;
    }
    if (!anchorEl) {
      this.destroyPopup();
      return;
    }
    const popup = this._popUp_subMenu;
    popup?.close('');
    const viewPops = {
      editorState: this.outerView.state,
      editorView: this.outerView,

      onCancel: this.onCancel,
      onEdit: this.onEditGlossary,
      onRemove: this.deleteGlossaryNode,
      onMouseOut: this.onGlossarySubMenuMouseOut,
    };
    this._popUp_subMenu = createPopUp(GlossarySubMenu, viewPops, {
      anchor: anchorEl,
      autoDismiss: false,
      onClose: this._onClose,
      position: atAnchorTopCenter,
    });
  }

  createGlossaryObject(editorView: EditorView, mode: number) {
    return {
      isGlossary: this.node.attrs.type,
      selectedRowRefID: this.node.attrs.id,
      term: this.node.attrs.term,
      mode: mode, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      runtime: this.runtime,
    };
  }
  onEditGlossary = async (
    view: EditorView,
  ): Promise<void> => {
    // eslint-disable-next-line
    let data: any;
    if ('description' in this.node.attrs && this.node.attrs.description !== null) {
      // Handle AcronymItem
      data = {
        id: this.node.attrs.id,
        term: this.node.attrs.term,
        definition: this.node.attrs.definition,
        description: this.node.attrs.description,
      };
    } else {
      // Handle GlossaryItem
      data = {
        id: this.node.attrs.id,
        term: this.node.attrs.term,
        definition: this.node.attrs.definition,
      };
    }
    try {
      const runtime = view?.['runtime'];
      const updatedData = await runtime.glossaryService.editGlossary(data);

      if (updatedData === null) {
        return;
      }
      const glossary = {
        glossaryObject: updatedData,
      };
      this.updateGlossaryDetails(view, glossary);
    } catch {
      return;
    }
  };

  updateGlossaryDetails(view: EditorView, glossary): void {
    if (view.dispatch) {
      const {selection} = view.state;
      let {tr} = view.state;
      tr = tr.setSelection(selection);
      tr = this.updateGlossaryObject(tr, glossary) as Transaction;
      view.dispatch(tr);
    }
  }

  updateGlossaryObject(tr: Transform, glossary): Transform {
    const newattrs = {};
    Object.assign(newattrs, this.node.attrs);
    newattrs['id'] = glossary.glossaryObject.id;
    newattrs['description'] = glossary.glossaryObject.description;
    newattrs['term'] = glossary.glossaryObject.term;
    newattrs['definition'] = glossary.glossaryObject.definition;
    tr = tr.setNodeMarkup(this.node.attrs.from, undefined, newattrs);
    return tr;
  }

  deleteGlossaryNode = (view: EditorView): void => {
    const { state, dispatch } = view;
    // Added fix for the issue that multiple glossary/acronym won't get deleted from the Doc
    const glossaryNode = this.node;
    const nodeType = glossaryNode?.type?.name;

    if (glossaryNode && nodeType === 'glossary') {
      const tr = state.tr.replaceWith(
        this.getPos(),
        this.getPos() + glossaryNode.nodeSize,
        state.schema.text(this.node.attrs.term)
      );
      dispatch(tr);
      const glossarySpan = document.getElementById(
        this.node.attrs.term + this.node.attrs.id + this.node.attrs.from
      );
      if (glossarySpan) {
        glossarySpan.remove();
      }
    }
  };

  getNodeType(state) {
    const node = state.tr.doc.nodeAt(this.node.attrs.from);
    return node?.type?.name;
  }

  getNameAfter(selection) {
    return selection.$head?.nodeAfter?.type?.name;
  }

  _onClose = (): void => {
    this._popUp_subMenu = null;
  };

  onCancel = (view: EditorView): void => {
    this.destroyPopup();
    view.focus();
  };

  destroyPopup(): void {
    this._popUp?.close('');
    this._popUp_subMenu?.close('');
  }

  onGlossarySubMenuMouseOut = (): void => {
    this.destroyPopup();
  };

  addGlossaryContent() {
    if (this.node.attrs.term) {
      const iconSpan = document.createElement('span');
      iconSpan.id =
        this.node.attrs.term + this.node.attrs.id + this.node.attrs.from;
      this.dom.appendChild(iconSpan);
      iconSpan.innerText = this.node.attrs.term;
      iconSpan.style.color = 'green';
      iconSpan.style.textDecoration = 'underline';
    }
  }

  open(e: MouseEvent): void {
    // Append a tooltip to the outer node
    // get the editor div
    const parent = this.outerView.dom.getElementsByClassName(
      'ProseMirror czi-prosemirror-editor'
    )[0];
    const tooltip = this.dom.appendChild(document.createElement('div'));
    tooltip.className = 'molcit-glossary-tooltip';
    const ttContent = tooltip.appendChild(document.createElement('div'));
    ttContent.innerHTML = this.node.attrs.definition;
    ttContent.className = 'ProseMirror molcit-glossary-tooltip-content';
    this.setContentRight(e, parent, tooltip, ttContent);
    if (window.screen.availHeight - e.clientY < 170 && ttContent.style.right) {
      ttContent.style.bottom = '114px';
    }
  }

  setContentRight(
    e: MouseEvent,
    parent: Element,
    tooltip: HTMLDivElement,
    ttContent: HTMLDivElement
  ) {
    // Append a tooltip to the outer node
    const MAX_CLIENT_WIDTH = 975;
    const RIGHT_MARGIN_ADJ = 50;
    const POSITION_ADJ = -110;

    if (parent) {
      const width_diff = e.clientX - parent.clientWidth;
      const counter = e.clientX > MAX_CLIENT_WIDTH ? RIGHT_MARGIN_ADJ : 0;
      if (width_diff > POSITION_ADJ && width_diff < tooltip.clientWidth) {
        ttContent.style.right =
          (parent as HTMLElement).offsetLeft + counter + 'px';
      }
    }
  }

  close(): void {
    const tooltip = this.outerView.dom.getElementsByClassName(
      'molcit-glossary-tooltip'
    );
    if (tooltip.length > 0) {
      tooltip[0].remove();
    }
  }

  update(node: Node): boolean {
    if (!node.sameMarkup(this.node)) return false;
    this.node = node;
    return true;
  }
  destroy(): void {
    this.removeEventListenerToView();
    this.close();
  }

  stopEvent(_event: Event): boolean {
    return false;
  }

  ignoreMutation(): boolean {
    return true;
  }
}
