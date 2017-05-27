var functions = require('firebase-functions');
var admin = require('firebase-admin');
var fetch = require('node-fetch');

admin.initializeApp(functions.config().firebase);

exports.fulfill_cool =
  functions.database.ref('/cache/{task}/url')
  .onWrite((event) => {
    return event.data.ref.parent.once("value")
      .then((ss) => {
        return ss.val();
      })
      .then((entry) => {
        const params = {
          key: functions.config().hangouts.key,
          token: functions.config().hangouts.token
        };

        const message = {};

        if (!entry.error) {
          message.text = `https://jpg.cool/${entry.phrase}`;
        } else {
          message.text = `Uh-oh, someone got an error for "${entry.phrase}"`;
        }

        const body = JSON.Stringify(message);
        const url = `https://dynamite.sandbox.googleapis.com/v1/rooms/AAAAiJBrU5o/webhooks?key=${params.key}&token=${params.token}`;
        console.log(url);
        console.log(body);

        return fetch({
          url,
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST",
          body
        });
      });
  });
