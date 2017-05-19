var functions = require('firebase-functions');

exports.hello_world = functions.https.onRequest((request, response) => {
  var x = 10;
  x.notAFunction();
  response.send("Hello from Firebase!");
});
