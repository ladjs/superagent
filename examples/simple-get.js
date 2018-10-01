/**
 * Module dependencies.
 */

const request = require('..');

const url =
  'https://gist.githubusercontent.com/reinaldo13/cdbb4d663ba23410a77b/raw/0345267767d50790051951ddc460e2699649de2b/it-works.txt';

request.get(url, (err, res) => {
  if (err) throw err;
  console.log(res.text);
});
