import Enzyme, { shallow } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import GlossaryListUI from './GlossaryListUI';
import React from 'react';
import { EditorRuntime } from './types';

Enzyme.configure({ adapter: new Adapter() });
describe('GlossaryListUI component init', () => {
    const gPropo = {
        glossaries: [],
        glossaryObject: { id: '3', term: 'CAS', description: 'Close Air Support' },
        selectedRowRefID: '3',
        isGlossary: false,
        term: 'CAS',
        close: () => { },
        runtime: '' as EditorRuntime
    };
    it('should render the GlossaryListUI component with Term', () => {
        const gPropo = {
            glossaries: [],
            glossaryObject: { id: '3', term: 'CAS', description: 'Close Air Support' },
            selectedRowRefID: '3',
            isGlossary: true,
            term: 'CAS',
            close: () => { },
            runtime: '' as EditorRuntime
        };
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        expect(listUIRender).toBeDefined();
    });
    it('should render the GlossaryListUI component with Abbreviation', () => {
        const gPropo = {
            glossaries: [],
            glossaryObject: { id: '3', term: 'CAS', description: 'Close Air Support' },
            selectedRowRefID: '3',
            isGlossary: false,
            term: 'CAS',
            close: () => { },
            runtime: '' as EditorRuntime
        };
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        expect(listUIRender).toBeDefined();
    });

    it('should call updateState method with null param', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        const res = null;
        listUIRender.updateState(res);
    });

    it('should call _cancel', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        listUIRender._cancel();
    });
    it('should call _save', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        listUIRender._save();
    });

    it('should call updateState method', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        const res = [
            {
                "id": "1",
                "term": "IAS",
                "description": "Indian Administrative Service"
            },
            {
                "id": "2",
                "term": "IIT",
                "description": "Indian Institute of Technology"
            }
        ];
        const authorEle = document.createElement('div');
        authorEle.id = 'termtxt';
        document.body.appendChild(authorEle);
        listUIRender.updateState(res);
        expect(listUIRender.state.glossaries).toEqual(res);
    });

    it('should set state based on the onRowClick method with undefined value', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        listUIRender.onRowClick(undefined);
    });

    it('should set state based on the onRowClick method', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        listUIRender.onRowClick('1');
        expect(listUIRender.state.selectedRowRefID).toEqual('1');
    });

    it('should call componentWillUnmount', () => {
        const wrapper = shallow(<GlossaryListUI {...gPropo} />);
        const listUIRender = wrapper.instance();
        listUIRender.componentWillUnmount();
        expect(listUIRender._unmounted).toEqual(true);
    });
});