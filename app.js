const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const zip = require('express-zip');
const fetchUrl = require("fetch").fetchUrl;
 
app.get('/', function (req, res) {
  res.send('working')
})

let urls  = [];
let files = [];

app.get('/download', function(req, res){
  files = [];

  urls.reduce( (accumulatorPromise, url, idx, array) => {
    return accumulatorPromise.then(() => {
      return download(url)
        .then(() => {
          files.push({ path : './' + url.name, name : url.name});
          if (idx === array.length -1) {
            res.zip(files, 'update.zip', () => {
              files.map((file) => {
                fs.unlinkSync(file.path);
              })
            });
          }
        })
    })
  }, Promise.resolve())

});

app.get('/check_update', function(req, res){ 
  urls = [];

  fetchUrl("http://local.yt-api.com/admin/static/plugin/update.json", function(error, meta, body){
    const updateFile = JSON.parse(body.toString());
    
    updateFile.filesToUpdate.map((file) => {
      urls.push({link: 'http://local.yt-api.com/admin/static/plugin/' + file, name: file})
    });

    res.status(200).json(updateFile);
  });
});

function download(url) {
  return new Promise((resolve, reject) => {
    let file = fs.createWriteStream(url.name);

    http.get(url.link, function(response) {
        response.on('data', function(chunk) {
          file.write(chunk)
        });

        response.on('end', function() {
          resolve('File download completed.');
        });
    });
  });
}
 
app.listen(1212);