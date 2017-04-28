var functions = require('firebase-functions');
var goon = require('goon');

exports.cool = functions.https.onRequest(goon.enableHTTPS("genki", {
  methods: ["GET"],
  arguments: ["get"],
  headers: {
    "Cache-Control": "private, max-age=0, no-cache"
  },
  verbose: true
}));
