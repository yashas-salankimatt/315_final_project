var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const load = require('audio-loader');
const { resolve } = require('path');
var router = express.Router();
const port = process.env.PORT || 3000

/*const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});/*


/* GET users listing. */
router.get('/', function(req, res, next) {
  /*var listFiles = fs.readdirSync('uploads/');
  var songsList = [];
  var artistList = [];
  var buttonInput = [];
  for(i = 0; i < listFiles.length; i++){
    songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
    artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
    buttonInput[i] = "/" + songsList[i] +"/" + artistList[i];
  }*/
  res.render('upload', {title: 'Upload Files'});
});

router.get('/:path', function(req, res, next) {
  var listFiles = fs.readdirSync(req.params.path.trim() + '/');
  var songsList = [];
  var artistList = [];
  var buttonInput = [];
  var totalDuration = 0;
  async function run(){
    for(i = 0; i < listFiles.length; i++){
      await load(req.params.path.trim().replace(/%20/g, " ") + '\\' + listFiles[i]).then(function (result) {
        // get audio duration
        totalDuration += result.duration;
      }).catch((error) => {res.redirect('/upload/' + req.params.path.replace(/\\/g, '%5C').trim());});
      songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
      artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
      buttonInput[i] = "/" + songsList[i] +"/" + artistList[i];
    }
    totalDuration = Math.trunc(totalDuration);
    var minutes = 0;
        while(totalDuration > 60){
          minutes += 1;
          totalDuration -= 60;
        }
        res.render('upload', {title: 'Upload Files', songNames: songsList, artistNames: artistList, buttonLinks: buttonInput, directory: req.params.path.replace(/\\/g, '%5C').trim(), status: 'success', trackLength: minutes.toString() + ":" + totalDuration.toString()});
  }
  run();
});

router.get('/:path/:songName', function(req, res, next) {
  var listFiles = fs.readdirSync(req.params.path.trim() + '/');
  var songName = req.params.songName;
  for(i = 0; i < listFiles.length; i++){
    if(listFiles[i].includes(songName.replace("%20", " "))){
      fs.rm(req.params.path + '/' + listFiles[i],(err) => {
        if(err){
            // File deletion failed
            console.error(err.message);
            return;
        }
      });
    }
  }
  res.redirect('/upload/' + req.params.path + '/');
});

/*router.post('/', function(req, res, next) {
  let upload = multer({ storage: storage}).any('music_file');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        
        if (!req.file) {
            var listFiles = fs.readdirSync('uploads/');
            var songsList = [];
            var artistList = [];
            var buttonInput = [];
            for(i = 0; i < listFiles.length; i++){
              songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
              artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
              buttonInput[i] = "/" + songsList[i] +"/" + artistList[i];
            }
            return res.render('upload', {title: 'Upload Files', status: "success", songNames: songsList, artistNames: artistList, buttonLinks: buttonInput});
            
        }
        else if (err) {
            return res.send(err);
        }

        return res.render('upload', {title: 'Upload Files', status: "Invalid selection, please try again."});
        
    });
});*/

router.post('/getPath', function(req, res, next) {
  var copyFiles = fs.readdirSync(req.body.source_path);
  for(i = 0; i < copyFiles.length; i++){
    if(copyFiles[i].slice(copyFiles[i].lastIndexOf('.'), copyFiles[i].length) != '.wav'){
      continue;
    }
    fs.copyFile(req.body.source_path + '/' + copyFiles[i], req.body.path + '/' + copyFiles[i], (err) => {
      if (err) {
        console.log("Error Found:", err);
      }
    });
  }

  var listFiles = fs.readdirSync(req.body.path + '/');
  var songsList = [];
  var artistList = [];
  var buttonInput = [];
  for(i = 0; i < listFiles.length; i++){
    if(listFiles[i].slice(listFiles[i].lastIndexOf('.'), listFiles[i].length) != '.wav'){
      continue;
    }
    songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
    artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
    buttonInput[i] = "/" + songsList[i] +"/" + artistList[i];
  }
  res.redirect('/upload/' + req.body.path.replace(/\\/g, '%5C').trim());
});
module.exports = router;
