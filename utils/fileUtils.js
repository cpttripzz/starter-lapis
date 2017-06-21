let fs = require('fs');
let Promise = require('bluebird');
let request = require('request');
let path = require('path');
let ps = require('promise-streams');
let mkdirp = require('mkdirp');
Promise.promisifyAll(request);

export function download(uri, directoryName, filename) {
  if(!existsSync(directoryName)){
    mkdirp(directoryName)
  }
  return ps.wait(request(uri).pipe(fs.createWriteStream(directoryName + '/' + filename)))
}

export function existsSync(filePath) {

  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
};