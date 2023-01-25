import { DOMSerializer, Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { PopUpHandle } from '@modusoperandi/licit-ui-commands';
import './ui/glossary.css';

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
  constructor(node: Node, view: EditorView, getPos: CBFn) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;
    const spec = DOMSerializer.renderSpec(
      document,
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
    const objPos = this.outerView.posAtCoords({ left, top, });
    return objPos ? objPos.pos : null;
  }

  addEventListenerToView(): void {
    this.dom.addEventListener('mouseover', this.showSourceText.bind(this));
    this.dom.addEventListener('mouseout', this.hideSourceText.bind(this));
  }
  removeEventListenerToView(): void {
    this.dom.removeEventListener('mouseover', this.showSourceText.bind(this));
    this.dom.removeEventListener('mouseout', this.hideSourceText.bind(this));
  }

  hideSourceText(_e: MouseEvent): void {
    this.close();
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

  onInfoSubMenuMouseOut = (): void => {
    this.destroyPopup();
  };


  addGlossaryContent() {
    if (this.node.attrs.term) {
      const iconSpan = document.createElement('span');
      this.dom.appendChild(iconSpan);
      iconSpan.innerText = this.node.attrs.term;
      iconSpan.style.color = 'green';
      iconSpan.style.textDecoration = 'underline';
    }
  }

  open(e: MouseEvent): void {
    // Append a tooltip to the outer node
    // get the editor div
    const parent = document.getElementsByClassName(
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
    const tooltip = document.getElementsByClassName('molcit-glossary-tooltip');
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
