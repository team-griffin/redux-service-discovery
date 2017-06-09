import 'babel-polyfill';

const context = require.context('./src', true, /^(.(?!__stories__))*\.js$/);

context.keys().forEach(function(path) {
  try {
    context(path);
  } catch(err) {
    console.error('[ERROR] WITH SPEC FILE: ', path);
    console.error(err);
    throw err;
  }
});
