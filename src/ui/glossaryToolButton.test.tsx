import Enzyme, { shallow } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import {GlossaryToolButton} from './glossaryToolButton';
import React from 'react';

Enzyme.configure({ adapter: new Adapter() });

it('should render the GlossarySubMenuIcon component', () => {
    const gPropo = {
        icon: 'icon',
        label: 'label',
    };
    const wrapper = shallow(<GlossaryToolButton {...gPropo} />);
    const toolbarRender = wrapper.instance();
    expect(toolbarRender).toBeDefined();
});