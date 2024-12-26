import * as React from 'react';
import {EditorView} from 'prosemirror-view';
import {GlossaryToolButton} from './ui/glossaryToolButton';
import {GlossarySubMenuIcon} from './ui/glossarySubMenuIcon';

type GlossarysubMenuProps = {
  editorView: EditorView;
  onEdit: (view: EditorView) => void;
  onRemove: (view: EditorView) => void;
  onMouseOut: () => void;
};

export class GlossarySubMenu extends React.PureComponent{

  declare props: GlossarysubMenuProps;
  state = {
    hidden: false,
  };

  render() {
    const { onEdit, onRemove, editorView, onMouseOut} = this.props;
    const disabled = editorView['readOnly'];

    return (
      <div className="molcit-glossary-submenu" onMouseLeave={onMouseOut} role="menu" tabIndex={-1}>
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


