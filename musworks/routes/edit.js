var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const load = require('audio-loader');
const { spawnSync } = require('child_process');
const { resolve } = require('path');
var router = express.Router();
const port = process.env.PORT || 3000

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('edit', {title: 'Edit Tracks'});
});


router.get('/:path', function(req, res, next) {
  var listFiles = fs.readdirSync(req.params.path.replace(/ /g, "") + '/');
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
    res.render('edit', {title: 'Edit Tracks', songNames: songsList, artistNames: artistList, buttonLinks: buttonInput, directory: req.params.path.replace(/\\/g, '%5C').trim(), trackLength: minutes.toString() + ":" + totalDuration.toString()});
  }
  run();
});

router.get('/:path/remove/:songName', function(req, res, next) {
  var listFiles = fs.readdirSync(req.params.path + '/');
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
  res.redirect('/edit/' + req.params.path +'/');
});

router.get('/:path/:songName', function(req, res, next) {
  var Names = req.params.songName.split(',');
  var fileName = Names[0] + '-' + Names[1] + '.wav';
  var listFiles = fs.readdirSync(req.params.path.trim() + '\\');
  for(i = 0; i < listFiles.length; i++){
    if(listFiles[i].includes(fileName)){
      load(req.params.path.trim().replace(/%20/g, " ") + '\\' + fileName).then(function (result) {
        // get audio duration
        var duration = result.duration
        var minutes = 0;
        /*while(duration > 60){
          minutes += 1;
          duration -= 60;
        }*/
        res.render('editSong', {songName: req.params.songName, directory: req.params.path.replace(/\\/g, '%5C').trim(), trackLength: duration});
      });
    }
  }
  
});

router.post('/:path/:songName/submit', function(req, res, next) {
  var Names = req.params.songName.split(',');
  var fileName = Names[0] + '-' + Names[1] + '.wav';
  var listFiles = fs.readdirSync(req.params.path.trim() + '\\');
  for(i = 0; i < listFiles.length; i++){
    if(listFiles[i].includes(fileName)){
      console.log(spawnSync('java', ['-jar', 'songEdit.jar', req.params.path.replace(/%20/g, " ") + '\\' + fileName, req.body.songStart.toString(), req.body.songEnd.toString(), "100"]).stderr.toString());
      fs.rename(req.params.path.replace(/%20/g, " ") + '\\' + Names[0] + '-' + Names[1] + "2.wav", req.params.path.replace(/%20/g, " ") + '\\' + fileName, (done)=>{});
    }
  }
  res.redirect('/edit/' + req.params.path + '/' + req.params.songName);
});

module.exports = router;
