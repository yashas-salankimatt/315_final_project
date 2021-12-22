var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { response } = require('express');
var router = express.Router();
const port = process.env.PORT || 3000

//import Darkmode from 'darkmode-js';




const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});

router.get('/', function(req, res, next) {
 
  res.render('tabs', {title: 'Sheet Music'});
});


/* GET users listing. */
router.get('/:path', function(req, res, next) {
  //new Darkmode().showWidget();
  var listFiles = fs.readdirSync(req.params.path.trim() + '/');
  var songsList = [];
  var artistList = [];
  var buttonInput = [];
  for(i = 0; i < listFiles.length; i++){
    songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
    artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
    buttonInput[i] = "/" + songsList[i] +"/" + artistList[i];
  }
  res.render('tabs', {title: 'Sheet Music', songNames: songsList, artistNames: artistList, buttonLinks: buttonInput, directory: req.params.path.replace(/\\/g, '%5C').trim()});
});

router.get('/:path/:songName/:artistName', function(req, res, next) {

  //set up request for API
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var request = new XMLHttpRequest();

  const url = 'https://api.lyrics.ovh/v1/' + req.params.artistName + '/' + req.params.songName
  request.open('GET', url);


  request.onreadystatechange = function(){
    if(this.readyState == 4){
      //edit lyrics so it's more presentable  
      var arrLyrics = [];
      arrLyrics = this.responseText.replace(/\\r/g, "").split("\\n");
      //arrLyrics = this.responseText.split("\\r");
      arrLyrics[0] = arrLyrics[0].replace("{\"lyrics\":\"", "");
      arrLyrics[arrLyrics.length-1] = arrLyrics[arrLyrics.length-1].replace("\"}", "");

  
      //display lyrics and sheet music window

      res.render('sheets', {sheetMusic: "http://www.songsterr.com/a/wa/bestMatchForQueryString?s=" + req.params.songName + "&a=" + req.params.artistName, lyrics: arrLyrics, directory: req.params.path.replace(/\\/g, '%5C').trim(), displayName: req.params.songName + ", by " + req.params.artistName});
    }
  };
  request.send();
});






module.exports = router;
