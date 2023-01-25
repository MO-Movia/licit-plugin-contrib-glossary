# licit-plugin-contrib-glossary
Glossary/Dictionary plugin - allows linking to a glossary/acronym/dictionary term, and when hovered over, displays the meaning/spelled out acronym/definition.

## Build

### Commands

- npm ci

- npm pack

#### To use this in Licit

Install the Glossary plugin in Licit

- npm install _modusoperandi-licit-glossary-0.0.1.tgz_

Include plugin in licit component

- import GlossaryPlugin

- add GlossaryPlugin instance in licit's plugin array

```

import  GlossaryPlugin  from  '@modusoperandi/licit-glossary';

const  plugins = [new  GlossaryPlugin()]

ReactDOM.render(<Licit docID={0} plugins={plugins}/>


```
