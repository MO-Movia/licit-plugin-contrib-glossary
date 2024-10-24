import * as React from 'react';
import {EditorView} from 'prosemirror-view';
import {GlossaryToolButton} from './ui/glossaryToolButton';
import {GlossarySubMenuIcon} from './ui/glossarySubMenuIcon';
import './ui/glossary.css';

type GlossarysubMenuProps = {
  editorView: EditorView;
  onCancel: (view: EditorView) => void;
  onEdit: (view: EditorView) => void;
  onRemove: (view: EditorView) => void;
  onMouseOut: () => void;
};

export class GlossarySubMenu extends React.PureComponent{

  declare props: GlossarysubMenuProps;
  _unmounted = false;

  state = {
    hidden: false,
  };

  render() {
    const { onEdit, onRemove, editorView, onMouseOut} = this.props;
    const disabled = editorView['readOnly'];

    return (
      <div className="molcit-glossary-submenu" onMouseLeave={onMouseOut}>
        <div className="molcit-glossary-submenu-body">
          <div className="molcit-glossary-submenu-row">
            <GlossaryToolButton
              disabled={disabled}
              icon={GlossarySubMenuIcon.get('edit')}
              onClick={onEdit}
              value={editorView}
            />
            <GlossaryToolButton
              disabled={disabled}
              icon={GlossarySubMenuIcon.get('delete')}
              onClick={onRemove}
              value={editorView}
            />
          </div>
        </div>
      </div>
    );
  }
}


