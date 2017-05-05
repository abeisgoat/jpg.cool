require('@google-cloud/debug-agent').start();
require('@google-cloud/trace-agent').start();

var functions = require('firebase-functions');
var modules = [
  require("./cool.js"),
  require("./purge.js")
]

process.env.azure_key = functions.config().env.azure_key;
process.env.gcs_bucket = functions.config().env.gcs_bucket;

modules.forEach(function (mod) {
  Object.keys(mod).forEach(function (func) {
    exports[func] = mod[func];
  });
});

console.log(exports)
