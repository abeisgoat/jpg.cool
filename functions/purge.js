'use strict';

let fs = require('fs');
let fbTools = require('firebase-tools');

const DEPLOY_DIR = '/tmp/hosting';
const FIREBASE_JSON_FILE = DEPLOY_DIR + '/firebase.json';
const PUBLIC_DIR = '/tmp/hosting/public';
const INDEX_FILE = PUBLIC_DIR + '/index.html';
const PROJECT_NAME = 'test-new-hosting-panel';

let createDir = function(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, 0x0777, (err) => {
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
    .then(() => createDir(PUBLIC_DIR))
    .then(() => writeFile(INDEX_FILE, `<html><body>${Date.now()}</body></html>`))
    .then(() => writeFile(FIREBASE_JSON_FILE, JSON.stringify({hosting:{public:'public'}})));
};

let deployHosting = function(project, token) {
  return fbTools.deploy({
    project: project,
    token: token,
    cwd: DEPLOY_DIR,
    only: 'hosting',
  });
};

module.exports = function(project, token) {
  return createHostingFiles().then(() => deployHosting(project, token));
};
