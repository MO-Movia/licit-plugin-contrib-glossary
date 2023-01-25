// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type { Glossary } from './types';
import { GET } from './http';

const GLOSSARY_URI = 'http://greathints.com:3003';

class GlossaryRuntime {
  /**
   * Cached styles fetched from the service to avoid saturating
   * service with HTTP requests.
   * @private
   */
  glosseries: Glossary[] = [];
  acronymById: Glossary = null;


  buildRouteForCitation(...path: string[]): string {
    return [GLOSSARY_URI, ...path].join('/');
  }

  getAcronyms(abbreviation: string): Promise<Glossary[]> {
    const url = this.buildRouteForCitation(
      'acronyms',
      encodeURIComponent(abbreviation)
    );

    return new Promise((resolve, reject) => {
      GET(url).then(
        (data: string) => {
          const acronym = JSON.parse(data);
          this.acronymById = acronym;
          resolve(acronym);
        },
        (_err) => {
          reject(null);
        }
      );
    });
  }

  getGlossary(term: string): Promise<Glossary[]> {
    const url = this.buildRouteForCitation(
      'glossaries',
      encodeURIComponent(term)
    );

    return new Promise((resolve, reject) => {
      GET(url).then(
        (data: string) => {
          const glossary = JSON.parse(data);
          this.acronymById = glossary;
          resolve(glossary);
        },
        (_err) => {
          reject(null);
        }
      );
    });
  }
}
export default GlossaryRuntime;
