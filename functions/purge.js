'use strict';

let fs = require('fs');
let fbTools = require('firebase-tools');
let functions = require('firebase-functions');

const DEPLOY_DIR = '/tmp/hosting';
const FIREBASE_JSON_FILE = DEPLOY_DIR + '/firebase.json';
const PUBLIC_DIR = 'public';
const FULL_PUBLIC_DIR = DEPLOY_DIR + '/' + PUBLIC_DIR;
const INDEX_FILE = FULL_PUBLIC_DIR + '/index.html';

let createDir = function(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, 0o777, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  }).catch((err) => {
    if (err.code != 'EEXIST') {
      return Promise.reject(err);
    }
  });
};

let writeFile = function(filename, contents) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, contents, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

let createHostingFiles = function() {
  return createDir(DEPLOY_DIR)
    .then(() => createDir(FULL_PUBLIC_DIR))
    .then(() => writeFile(INDEX_FILE, `<html><body>${Date.now()}</body></html>`))
    .then(() => writeFile(FIREBASE_JSON_FILE, JSON.stringify({hosting:{public:PUBLIC_DIR}})));
};

let deployHosting = function(project, token) {
  return fbTools.deploy({
    project: project,
    token: token,
    cwd: DEPLOY_DIR,
    only: 'hosting',
  });
};

exports.cdn = function(project, token) {
  return createHostingFiles().then(() => deployHosting(project, token));
};

try {
  functions.config(); // This will fail locally

  exports.purgeOnCacheChange = functions.database.ref('/cache/{key}').onWrite(event => {
    if (!event.previous.exists()) {
      return;
    }
    return exports.cdn(functions.config().projectId, process.env.FIREBASE_TOKEN);
  });
} catch (err) {
  if (err.message.indexOf('functions.config() is not available') < 0) {
    throw err;
  }
}
