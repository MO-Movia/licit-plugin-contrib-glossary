import {DOMSerializer, Node} from 'prosemirror-model';
import {EditorView, NodeView} from 'prosemirror-view';
import {
  GLOSSARY,
  GLOSSARY_PLUGIN_KEY,
  GlossaryRuntime,
  IndexItem,
} from './types';
import tippy from 'tippy.js';

export const cache: Record<string, Promise<IndexItem>> = {};
export type cacheInput = IndexItem[] | Promise<IndexItem[]>;
export function updateCache(values?: cacheInput) {
  if (Array.isArray(values)) {
    for (const item of values) {
      cache[item.id] = Promise.resolve(item);
    }
  } else {
    values?.then((v) => updateCache(v));
  }
}

export class GlossaryView implements NodeView {
  dom: globalThis.Node;
  constructor(
    private node: Node,
    outerView: EditorView
  ) {
    // We'll need these later
    const spec = DOMSerializer.renderSpec(
      outerView.dom.ownerDocument,
      this.node.type.spec.toDOM(this.node)
    );
    this.dom = spec.dom;
    (this.dom as Element).className = GLOSSARY;
    this.updateContent(outerView);
  }

  private async updateContent(view: EditorView) {
    const id = this.node.attrs.id;
    (this.dom as Element).textContent = this.node.attrs.term;
    cache[id] ??= (
      view.state.plugins
        .find((p) => p.spec.key === GLOSSARY_PLUGIN_KEY)
        ?.getState(view.state)?.runtime as GlossaryRuntime
    )?.glossaryService?.fetchTerm?.(id);

    (this.dom as Element).textContent =
      (await cache[id])?.term ?? this.node.attrs.term;
    tippy(this.dom as Element, {
      content: (await cache[id])?.definition ?? this.node.attrs.definition,
    });
  }

  update(node: Node): boolean {
    if (!node.sameMarkup(this.node)) {
      return false;
    }
    this.node = node;
    return true;
  }

  stopEvent(_event: Event): boolean {
    return false;
  }

  ignoreMutation(): boolean {
    return true;
  }
}
