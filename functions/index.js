var functions = require('firebase-functions');
var admin = require('firebase-admin');
var modules = [
  require("./cool.js"),
  require("./purge.js"),
  require("./chat.js")
]

admin.initializeApp(functions.config().firebase);

process.env.azure_key = functions.config().env.azure_key;
process.env.gcs_bucket = functions.config().env.gcs_bucket;

modules.forEach(function (mod) {
  Object.keys(mod).forEach(function (func) {
    exports[func] = mod[func];
  });
});
