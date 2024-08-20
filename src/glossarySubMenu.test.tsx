import {GlossarySubMenu} from './glossarySubMenu';
import {EditorView} from 'prosemirror-view';

describe('GlossarySubMenu', () => {
  it('should render the GlossarySubMenu component', () => {
    const subMenuProps = {
      editorView: '' as unknown as EditorView,
      onEdit: () => undefined,
      onRemove: () => undefined,
      onMouseOut: () => undefined,
    };
    const glossaryconSubMenu = new GlossarySubMenu ({...subMenuProps});
    expect(glossaryconSubMenu).toBeDefined();
  });
});
