// [FS] IRAD-1251 2021-03-10
// UI for Citation dialog
import * as React from 'react';
import {EditorRuntime, Glossary} from './types';
import './ui/glossary.css';

type GlossaryListProps = {
  glossaries: Glossary[];
  glosarryObject: Glossary;
  selectedRowRefID: string;
  isGlossary: boolean;
  term: string;
  close: (val?) => void;
  runtime: EditorRuntime;
};
let glosarryObject: Glossary;
let selectedRowRefID = '';
let glossaries: Glossary[] = [];

class GlossaryListUI extends React.PureComponent<
  GlossaryListProps,
  GlossaryListProps
> {
  _unmounted = false;
  _popUp = null;

  constructor(props: GlossaryListProps) {
    super(props);
    this.state = {
      ...props,
      glosarryObject,
      glossaries,
    };
  }

  getGlossary(): void {
    const runtime = this.props.runtime;
    if (this.state.isGlossary && typeof runtime.getGlossary === 'function') {
      runtime.getGlossary(this.state.term).then((result) => {
        this.updateState(result);
      });
    } else if (
      !this.state.isGlossary &&
      typeof runtime.getAcronyms === 'function'
    ) {
      runtime.getAcronyms(this.state.term).then((result) => {
        this.updateState(result);
      });
    }
  }

  updateState(result: Glossary[]) {
    if (result) {
      glossaries = [];
      result.forEach((obj) => {
        glossaries.push({
          id: obj.id,
          term: obj.term,
          description: obj.description,
        });
      });
      this.setState({
        glossaries: glossaries,
      });
      this.setTermValue();
    }
  }

  componentWillUnmount(): void {
    this._unmounted = true;
  }

  componentDidMount(): void {
    this.getGlossary();
  }

  render(): React.ReactNode {
    const labelValue = this.state.isGlossary ? 'Term' : 'Abbreviation';
    return (
      <div
        style={{
          width: '780px',
          border: '1px solid lightgray',
          boxShadow: '1px 1px',
        }}
      >
        <form className="czi-form" style={{height: '272px'}}>
          <div>
            <div className="molcit-div-display">
              <label
                className="molcit-citation-label"
                key="lbldocTitle"
                style={{display: 'block', marginLeft: '2px'}}
              >
                {labelValue}
              </label>
              <input
                autoComplete="off"
                className="molcit-textborder search-key"
                id="termtxt"
                key="txtdocTitle"
                onChange={this.onSearchGlossary.bind(this)}
                style={{height: '20px', width: '170px'}}
                type="text"
              />
            </div>

            <div></div>
            <div className="molcit-searchdiv">
              <table className="molcit-tablecitations" id="myTable">
                <thead style={{backgroundColor: 'lightgray'}}>
                  <tr className="molcit-citationrow">
                    <th className="molcit-citationsheader"> {labelValue}</th>
                    <th className="molcit-citationsheader">Description</th>
                  </tr>
                </thead>
                <tbody className="molcit-citationbody">
                  {this.state.glossaries.map((item) => (
                    <tr
                      className={
                        this.state.selectedRowRefID === item.id
                          ? 'molcit-rowselected'
                          : ''
                      }
                      key={item.id}
                      onClick={this.onRowClick.bind(this, item.id)}
                    >
                      <td>{item.term}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                float: 'right',
                marginRight: '-8px',
                marginTop: '5px',
              }}
            >
              <button
                key="btnOk"
                onClick={this._save.bind(this)}
                style={{display: 'none', height: '27px', width: '60px'}}
              >
                OK
              </button>
            </div>
          </div>
          <div style={{marginTop: '6px'}}>
            <button
              key="btnCancel"
              onClick={this._cancel}
              style={{
                height: '27px',
                float: 'right',
                marginTop: '1px',
                width: '60px',
              }}
            >
              Cancel
            </button>
            <button
              className="btnsave"
              key="btnOk1"
              onClick={this._save.bind(this)}
              style={{
                height: '27px',
                float: 'right',
                width: '60px',
                marginTop: '1px',
                marginRight: '5px',
              }}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    );
  }

  onRowClick(refId: string): void {
    selectedRowRefID = refId;
    if (selectedRowRefID !== undefined) {
      glosarryObject = this.state.glossaries.find(
        (u) => u.id === selectedRowRefID
      );

      this.setState({selectedRowRefID, glosarryObject});
    }
  }

  setTermValue() {
    const authorEle = document.getElementById('termtxt');
    if (authorEle instanceof HTMLInputElement) {
      authorEle.value = this.state.term;
    }
    this.onSearchGlossary();
  }

  onSearchGlossary(): void {
    let filteredGlossary = glossaries;
    const authorEle = document.getElementById('termtxt');
    const term = authorEle instanceof HTMLInputElement ? authorEle.value : '';

    filteredGlossary = filteredGlossary.filter((val) => {
      const found = val.term.toUpperCase().includes(term.toUpperCase());
      if (found) {
        selectedRowRefID = val.id;
        glosarryObject = val;
      }
      return found;
    });
    this.setState({
      term: term,
      glossaries: filteredGlossary,
      selectedRowRefID,
      glosarryObject,
    });
  }

  _cancel = (): void => {
    this.props.close();
  };

  _save = (): void => {
    this.props.close(this.state);
  };
}

export default GlossaryListUI;
