var functions = require('firebase-functions');
var goon = require('goon');
var admin = require('firebase-admin');
var crypto = require('crypto');

admin.initializeApp(functions.config().firebase);

var genki = goon.enableEvent("genki", {
  arguments: ["get"],
  verbose: true
});

exports.request_cool =
  functions.https.onRequest((req, res) => {
    var r = {phrase: req.path.slice(1, req.path.length)};
    var wait = function (snap) {
      var val = snap.val();
      if (!val || !val.url) return;

      res.redirect(val.url);
      ref.off("value", wait);
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
      var r = {url: "https://jpg.cool/error.gif"}
      try {
        r = JSON.parse(resp)
      } catch (err) {}
      event.data.ref.update(r);
    });
  });
