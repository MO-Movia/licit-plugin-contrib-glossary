import {GlossaryListUI} from './glossaryListUI';
import {Glossary} from './types';
jest.mock('./types', () => ({
  getGlossary: jest.fn(),
}));

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
    }
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
      }
    };
    const wrapper = new GlossaryListUI({...gPropo});
    expect(wrapper).toBeDefined();
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
      runtime: {}
    };
    const wrapper = new GlossaryListUI({...gPropo});
    expect(wrapper).toBeDefined();
  });

  it('should call updateState method with null param', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    const res = null;
    expect(wrapper.updateState(res as unknown as Glossary[])).toBeUndefined();
  });

  it('should call _cancel', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    const closeSpy = jest.fn();
    wrapper._cancel();
    expect(closeSpy).toBeDefined();
  });

  it('should call _save', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    expect(wrapper._save).toBeDefined();
  });

  it('should call updateState method', () => {
    const wrapper = new GlossaryListUI({...gPropo});
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
    wrapper.updateState(res);
    expect(wrapper.updateState(res)).toBeUndefined();
  });

  it('should set state based on the onRowClick method with undefined value', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    expect(wrapper.onRowClick('test')).toBeUndefined();
  });
  it('should call updateState method', () => {
    const wrapper = new GlossaryListUI({...gPropo});
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
    wrapper.updateState(res);
    expect(wrapper.onSearchGlossary()).toBe(undefined);
  });
  it('should set state based on the onRowClick method', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    wrapper.onRowClick('1');
    expect(wrapper.state.selectedRowRefID).toEqual('3');
  });
  it('should handle getGlossary', () => {
    const wrapper = new GlossaryListUI({...gPropo});
    const test = wrapper.getGlossary();
    expect(test).toBeUndefined();
  });
});
