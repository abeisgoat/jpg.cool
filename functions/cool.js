var functions = require('firebase-functions');
var goon = require('goon');
var admin = require('firebase-admin');
var crypto = require('crypto');

var genki = goon.enableEvent("genki", {
  arguments: ["get"],
  verbose: true
});

const errorResponse = {
  url: "https://jpg.cool/error.gif",
  error: true
};

exports.request_cool =
  functions.https.onRequest((req, res) => {
    var r = {phrase: req.path.slice(1, req.path.length)};
    var wait = function (snap) {
      var val = snap.val();
      if (val && val.url) {
        res.redirect(val.url);
        ref.off("value", wait);
      } else if (val && val.error) {
        res.redirect(errorResponse.url);
        ref.off("value", wait);
      }
    }
    var hash = crypto.createHash('md5').update(r.phrase).digest("hex").toString();
    var ref = admin.database().ref("cache").child(hash);
    ref.update(r);
    ref.on("value", wait);
  });

exports.fulfill_cool =
  functions.database.ref('/cache/{task}')
  .onWrite((event) => {
    if (event.data.val().url)
      return

    return genki(event).then((resp) => {
      var r = errorResponse;

      try {
        r = JSON.parse(resp);
      } catch (err) {}

      return event.data.ref.update(r);
    });
  });
