const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    strict: true,
    header: config.header.mit,
  }),
  {
    rules: {
      //Include any rule overrides here!
    },
  },
];
