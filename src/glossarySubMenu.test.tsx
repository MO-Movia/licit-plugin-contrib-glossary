import Enzyme, { shallow } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { GlossarySubMenu } from './glossarySubMenu';
import React from 'react';

Enzyme.configure({ adapter: new Adapter() });
describe('GlossarySubMenu', () => {
    it('should render the GlossarySubMenu component', () => {
        const subMenuProps = {
            editorView: '' as any,
            onCancel: '' as any,
            onEdit: '' as any,
            onRemove: '' as any,
            onMouseOut: '' as any
        };
        const wrapper = shallow(<GlossarySubMenu {...subMenuProps} />);
        const glossaryconSubMenu = wrapper.instance();
        expect(glossaryconSubMenu).toBeDefined();
    });
});