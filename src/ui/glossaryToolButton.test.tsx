import {GlossaryToolButton} from './glossaryToolButton';

it('should render the GlossarySubMenuIcon component', () => {
    const gPropo = {
        icon: 'icon',
        label: 'label',
    };
    const wrapper = new GlossaryToolButton({...gPropo});
    expect(wrapper).toBeDefined();
});