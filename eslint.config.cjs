const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    strict: true,
  }),
  {
    rules: {
      //Include any rule overrides here!
    },
  },
];
