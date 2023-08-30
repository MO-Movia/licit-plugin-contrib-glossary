import Enzyme, {shallow} from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import GlossaryListUI from './glossaryListUI';
import React from 'react';
import {EditorRuntime, Glossary} from './types';
jest.mock('./types', () => ({
  getGlossary: jest.fn(),
}));
Enzyme.configure({adapter: new Adapter()});
describe('GlossaryListUI component init', () => {
  const gPropo = {
    glossaries: [],
    glossaryObject: {id: '3', term: 'CAS', description: 'Close Air Support'},
    selectedRowRefID: '3',
    isGlossary: false,
    term: 'CAS',
    close: () => {
      return;
    },
    runtime: {
      getAcronyms(_abbreviation: string): Promise<Glossary[]> {
        return Promise.resolve([
          {
            id: '1',
            term: 'ASAP',
            description:
              'ASAP is an acronym for as soon as possible. This common phrase means you will do something when you have the chance.',
          },
          {
            id: '2',
            term: 'IMAX',
            description:
              'The IMAX in IMAX Theater actually stands for Image Maximum. This is a large-format movie theater.',
          },
        ]);
      },
    } as EditorRuntime,
  };
  it('should render the GlossaryListUI component with Term', () => {
    const gPropo = {
      glossaries: [],
      glossaryObject: {id: '3', term: 'CAS', description: 'Close Air Support'},
      selectedRowRefID: '3',
      isGlossary: true,
      term: 'CAS',
      close: () => {
        return;
      },
      runtime: {
        getGlossary(_term: string): Promise<Glossary[]> {
          return Promise.resolve([
            {
              id: '1',
              term: 'IAS',
              description: 'Indian Administrative Service',
            },
            {
              id: '2',
              term: 'IIT',
              description: 'Indian Institute of Technology',
            },
            {id: '3', term: 'CAS', description: 'Close Air Support'},
          ]);
        },
      } as EditorRuntime,
    };
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    expect(listUIRender).toBeDefined();
  });
  it('should render the GlossaryListUI component with Abbreviation', () => {
    const gPropo = {
      glossaries: [],
      glossaryObject: {id: '3', term: 'CAS', description: 'Close Air Support'},
      selectedRowRefID: '3',
      isGlossary: false,
      term: 'CAS',
      close: () => {
        return;
      },
      runtime: {} as EditorRuntime,
    };
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    expect(listUIRender).toBeDefined();
  });

  it('should call updateState method with null param', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    const res = null;
    expect(listUIRender.updateState(res)).toBeUndefined();
  });

  it('should call _cancel', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    listUIRender.props = {close: () => undefined};
    const spy = jest.spyOn(listUIRender.props, 'close');
    listUIRender._cancel();
    expect(spy).toHaveBeenCalled();
  });
  it('should call _save', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    listUIRender.props = {close: () => undefined};
    listUIRender.state = {};
    const spy = jest.spyOn(listUIRender.props, 'close');
    listUIRender._save();
    expect(spy).toHaveBeenCalledWith({});
  });
  it('should call updateState method', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    const res = [
      {
        id: '1',
        term: 'IAS',
        description: 'Indian Administrative Service',
      },
      {
        id: '2',
        term: 'IIT',
        description: 'Indian Institute of Technology',
      },
    ];
    listUIRender.updateState(res);
    expect(listUIRender.state.glossaries).toEqual(res);
  });

  it('should set state based on the onRowClick method with undefined value', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    expect(listUIRender.onRowClick(undefined)).toBeUndefined();
  });
  it('should call updateState method', () => {
    const wrapper = shallow(<GlossaryListUI {...gPropo} />);
    const listUIRender = wrapper.instance();
    const res = [
      {
        id: '1',
        term: 'IAS',
        description: 'Indian Administrative Service',
      },
      {
        id: '2',
        term: 'IIT',
        description: 'Indian Institute of Technology',
      },
    ];
    const authorEle = document.createElement('input');
    authorEle.id = 'termtxt';
    document.body.appendChild(authorEle);
    listUIRender.updateState(res);
    expect(listUIRender.onSearchGlossary()).toBe(undefined);
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
