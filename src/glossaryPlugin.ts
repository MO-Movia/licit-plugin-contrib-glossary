import {Node, Schema} from 'prosemirror-model';
import {Plugin} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {
  makeKeyMapWithCommon,
  createKeyMapPlugin,
} from '@modusoperandi/licit-doc-attrs-step';
import {GlossaryNodeSpec} from './glossaryNodeSpec';
import {GlossaryView, updateCache} from './glossaryView';
import {GLOSSARY_PLUGIN_KEY, GlossaryRuntime, GLOSSARY} from './types';
import {GlossaryCommand} from './glossaryCommand';

export const KEY_GLOSSARY = makeKeyMapWithCommon(
  GLOSSARY,
  'Mod-Alt' + '-g'
) as {common: string};

export class GlossaryPlugin extends Plugin<{runtime?: GlossaryRuntime}> {
  constructor(private readonly runtime?: GlossaryRuntime) {
    super({
      key: GLOSSARY_PLUGIN_KEY,
      props: {
        nodeViews: {
          [GLOSSARY]: bindGlossaryView,
        },
      },
      state: {
        init(_config, _state) {
          return {runtime};
        },
        apply(_tr, _prev, _, _newState) {
          return _prev;
        },
      },
    });
    updateCache(runtime?.cache);
  }

  getEffectiveSchema(schema: Schema): Schema {
    const nodes = schema.spec.nodes.addToEnd(GLOSSARY, GlossaryNodeSpec);
    const marks = schema.spec.marks;
    schema = new Schema({nodes, marks});
    return schema;
  }

  initKeyCommands(): unknown {
    return createKeyMapPlugin(
      {
        [KEY_GLOSSARY.common]: new GlossaryCommand(this.runtime)
          .waitForUserInput,
      },
      'GlossaryKeyMap'
    );
  }

  initButtonCommands(): unknown {
    return {
      '[menu_book] Insert Glossary/Acronym': new GlossaryCommand(this.runtime),
    };
  }
}

function bindGlossaryView(
  node: Node,
  view: EditorView
  // curPos: () => number
): GlossaryView {
  return new GlossaryView(node, view);
}
