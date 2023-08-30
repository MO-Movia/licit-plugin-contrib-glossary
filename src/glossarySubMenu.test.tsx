import Enzyme, {shallow} from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import {GlossarySubMenu} from './glossarySubMenu';
import React from 'react';
import {EditorView} from 'prosemirror-view';

Enzyme.configure({adapter: new Adapter()});
describe('GlossarySubMenu', () => {
  it('should render the GlossarySubMenu component', () => {
    const subMenuProps = {
      editorView: '' as unknown as EditorView,
      onCancel: () => undefined,
      onEdit: () => undefined,
      onRemove: () => undefined,
      onMouseOut: () => undefined,
    };
    const wrapper = shallow(<GlossarySubMenu {...subMenuProps} />);
    const glossaryconSubMenu = wrapper.instance();
    expect(glossaryconSubMenu).toBeDefined();
  });
});
