'use strict';
let purge = require('../purge');

let main = function() {
  return purge.cdn('test-new-hosting-panel', process.env.FIREBASE_TOKEN)
    .then((data) => console.log('resolved:', data))
    .catch((err) => console.log('rejected:', err));
};
main().catch(() => null).then(() => process.exit());
