import {GlossarySubMenuIcon} from './glossarySubMenuIcon';

let props: {
    type: 'type';
    title: 'title';
};
it('should render the component', () => {
    const wrapper = new GlossarySubMenuIcon(props);
    wrapper.props = {
        type: 'type',
        title: 'title',
    };
    wrapper.title = 'title';
    GlossarySubMenuIcon.get('');
    expect(wrapper).toBeDefined();
});