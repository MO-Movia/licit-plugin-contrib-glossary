import { DOMSerializer, Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { createPopUp, PopUpHandle, atAnchorTopCenter } from '@modusoperandi/licit-ui-commands';
import './ui/glossary.css';
import { Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import GlossarySubMenu from './glossarySubMenu';
import GlossaryListUI from './glossaryListUI';
import { EditorRuntime } from './types';

type CBFn = () => void;
const GLOSSARY = 'glossary';

export type Style = {
  styles?: {
    underline?;
    textHighlight?: string;
  };
};

class GlossaryView {
  node: Node = null;
  outerView: EditorView = null;
  getPos = null;
  _popUp: PopUpHandle | null = null;
  _popUp_subMenu: PopUpHandle | null = null;
  dom: globalThis.Node = null;
  offsetLeft: Element;
  runtime: EditorRuntime;
  constructor(node: Node, view: EditorView, getPos: CBFn) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.runtime = view['runtime'];
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
    const objPos = this.outerView.posAtCoords({ left, top });
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
    if (e && e.currentTarget) {
      anchorEl = e.currentTarget as globalThis.Node;
    }
    if (!anchorEl) {
      this.destroyPopup();
      return;
    }
    const popup = this._popUp_subMenu;
    popup && popup.close('');
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

  onEditGlossary = (view: EditorView): void => {
    this._popUp_subMenu && this._popUp_subMenu.close('');

    this._popUp = createPopUp(
      GlossaryListUI,
      this.createGlossaryObject(view, 2),
      {
        modal: true,
        IsChildDialog: false,
        autoDismiss: false,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            if (undefined !== val) {
              this.updateGlossaryDetails(view, val);
            }
          }
        },
      }
    );
  }

  updateGlossaryDetails(view: EditorView, glossary): void {
    if (view.dispatch) {
      const { selection } = view.state;
      let { tr } = view.state;
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
    tr = tr.setNodeMarkup(
      this.node.attrs.from,
      undefined,
      newattrs
    );
    return tr;
  }

  deleteGlossaryNode = (view: EditorView): void => {
    const { state } = view;
    const glossaryNode = state.tr.doc.nodeAt(this.node.attrs.from);
    const nodeType = glossaryNode && glossaryNode.type?.name;
    if (glossaryNode && 'glossary' === nodeType) {
      const node = state.schema.text(this.node.attrs.term);
      const tr = state.tr.replaceRangeWith(this.node.attrs.from, this.node.attrs.to, node);
      const glossarySpan = document.getElementById(this.node.attrs.term + this.node.attrs.id + this.node.attrs.from);
      if (glossarySpan) {
        glossarySpan.style.color = 'black';
        glossarySpan.style.textDecoration = 'none';
      }
      view.dispatch(tr);
    }
  }

  getNodeType(state) {
    const node = state.tr.doc.nodeAt(this.node.attrs.from);
    return node && node.type?.name;
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
    this._popUp && this._popUp.close('');
    this._popUp_subMenu && this._popUp_subMenu.close('');
  }

  onGlossarySubMenuMouseOut = (): void => {
    this.destroyPopup();
  };

  addGlossaryContent() {
    if (this.node.attrs.term) {
      const iconSpan = document.createElement('span');
      iconSpan.id = this.node.attrs.term + this.node.attrs.id + this.node.attrs.from;
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
    ttContent.innerHTML = this.node.attrs.description;
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

export default GlossaryView;
