import { Node, Schema } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  makeKeyMapWithCommon,
  createKeyMapPlugin,
} from '@modusoperandi/licit-doc-attrs-step';
import {GlossaryNodeSpec} from './glossaryNodeSpec';
import {GlossaryView} from './glossaryView';
import { GlossaryCommand } from './glossaryCommand';

export const GLOSSARY = 'glossary';
export const ACRONYM = 'acronym';

export const KEY_GLOSSARY = makeKeyMapWithCommon(
  GLOSSARY,
  'Mod-Alt' + '-g'
);
export const KEY_ACRONYM = makeKeyMapWithCommon(
  ACRONYM,
  'Mod-Alt' + '-a'
);

export class GlossaryPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('GlossaryPlugin'),
      props: {
        nodeViews: {},
      },
      state: {
        init(_config, _state) {
          this.spec.props.nodeViews[GLOSSARY] = bindGlossaryView.bind(this);
        },
        apply(_tr, _prev, _, _newState) {
          //do nothing
        },
      },
    });
  }

  getEffectiveSchema(schema: Schema): Schema {
    const nodes = schema.spec.nodes.addToEnd('glossary', GlossaryNodeSpec);
    const marks = schema.spec.marks;
    schema = new Schema({ nodes, marks });
    return schema;
  }

  initKeyCommands(): unknown {
    return createKeyMapPlugin(
      {
        [KEY_GLOSSARY.common]: new GlossaryCommand(true).waitForUserInput,
      },
      'GlossaryKeyMap'
    );
  }

  initButtonCommands(): unknown {
    return {
      '[menu_book] Glossary': new GlossaryCommand(true),
      '[library_books] Acronym': new GlossaryCommand(false),
    };
  }
}

export function bindGlossaryView(
  node: Node,
  view: EditorView,
  curPos: boolean | (() => number)
): GlossaryViewExt {
  return new GlossaryViewExt(node, view, curPos);
}

class GlossaryViewExt extends GlossaryView {
  constructor(node: Node, view: EditorView, getCurPos) {
    super(node, view, getCurPos);
  }
}
