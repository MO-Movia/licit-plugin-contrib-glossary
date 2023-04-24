import Enzyme, { shallow } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import GlossarySubMenuIcon from './glossarySubMenuIcon';
import React from 'react';

Enzyme.configure({ adapter: new Adapter() });
let props: {
    type: 'type';
    title: 'title';
};
it('should render the component', () => {
    const wrapper = shallow(<GlossarySubMenuIcon {...props} />);
    wrapper.props = {
        type: 'type',
        title: 'title',
    };
    wrapper.title = 'title';
    const GlossarySubMenuIconRender = wrapper.instance();
    GlossarySubMenuIconRender.title = 'title';
    expect(GlossarySubMenuIconRender).toBeDefined();
});