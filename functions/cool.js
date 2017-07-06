var functions = require('firebase-functions');
var goon = require('goon');
var admin = require('firebase-admin');
var crypto = require('crypto');
var Analytics = require('analytics-node');
var analytics = new Analytics(functions.config().segmentio.writekey, {
  flushAfter: 500
});

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

    analytics.track({
      userId:'jpg-cool',
      event: 'request_cool',
      properties: r
    });

    var wait = function (snap) {
      var val = snap.val();
      if (val && val.url) {
        performAnalyticsFlush().then(() => {
            res.redirect(val.url);
        });
        ref.off("value", wait);
      } else if (val && val.error) {
        performAnalyticsFlush().then(() => {
            res.redirect(errorResponse.url);
        });
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

        analytics.track({
          userId:'jpg-cool',
          event: 'fulfill_cool',
          properties: r
        });
      } catch (err) {
        analytics.track({
          userId:'jpg-cool',
          event: 'fulfill_cool_error',
          properties: {
            error: err
          }
        });
      }

      return Promise.all([
        performAnalyticsFlush();
        event.data.ref.update(r)
      ]);
    });
  });

function performAnalyticsFlush() {
  return new Promise(function(resolve, reject) {
    analytics.flush(function(err, batch){
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
