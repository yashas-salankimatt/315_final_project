const fetch = require("node-fetch");
var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const load = require('audio-loader');
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
  
  res.render('recommendations', { title: 'Recommendations'});
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
      });
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
        res.render('recommendations', { title: 'Recommendations', songNames: songsList, artistNames: artistList, buttonLinks: buttonInput, directory: req.params.path.replace(/\\/g, '%5C').trim(), trackLength: minutes.toString() + ":" + totalDuration.toString()});
  }
  run();
});

router.get('/:path/list', function(req, res, next) {
  var includes = [];
  var j = 0;
  for (var propName in req.query) {
    if (req.query.hasOwnProperty(propName)) {
        if(propName.includes('checked')){
          includes[j] = propName.charAt(7);
          j = j + 1;
        }
    }
}

  var listFiles = fs.readdirSync(req.params.path + '/');
  var songsList = [];
  var artistList = [];
  for(i = 0; i < listFiles.length; i++){
    songsList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(0,listFiles[i].lastIndexOf('-'));
    artistList[i] = listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).slice(listFiles[i].lastIndexOf('-') + 1, listFiles[i].slice(0,listFiles[i].lastIndexOf('.')).length);
  }
  var songIncludes = [];
  var artistIncludes = [];
  for(i = 0; i < includes.length; i++){
    songIncludes[i] = songsList[includes[i]];
    artistIncludes[i] = artistList[includes[i]];
  }
  var searched = req.query['name'];

  

  function getRecs(searchQ){
    var myObj, i, x = "", counter = 0, tmp = "";
    for(i = 0; i < searchQ.length; i++)
    {
      tmp += searchQ[i] + ",";
    }
    tmp += searched;
    console.log(tmp);

    fetch('https://tastedive.com/api/similar?' + new URLSearchParams({
      q: tmp,
      type: 'music',
      key: '407903-MusWork-NUWV9Y1M'
    }))
        .then(response => 
          {
            return response.text();
          })
        .then(data => {
            myObj = JSON.parse(data);
            for(i in myObj.Similar.Results)
            {
              x += myObj.Similar.Results[i].Name + ", ";
            }
            res.render('recommendationsSet', { title: 'Recommendations', songNames: songIncludes, artistNames: artistIncludes, recommendations: x.split(','), directory: req.params.path.replace(/\\/g, '%5C').trim()});
        });
      }
      getRecs(artistIncludes);

    
});

router.get('/noDirectory/artists', function(req, res, next) {
  var searched = req.query['name'];

  

  function getRecs(searchQ){
    var myObj, i, x = "", counter = 0, tmp = "";
    for(i = 0; i < searchQ.length; i++)
    {
      tmp += searchQ[i] + ",";
    }
    tmp += searched;
    console.log(tmp);

    fetch('https://tastedive.com/api/similar?' + new URLSearchParams({
      q: tmp,
      type: 'music',
      key: '407903-MusWork-NUWV9Y1M'
    }))
        .then(response => 
          {
            return response.text();
          })
        .then(data => {
            myObj = JSON.parse(data);
            for(i in myObj.Similar.Results)
            {
              x += myObj.Similar.Results[i].Name + ", ";
            }
            res.render('recommendationsSet', { title: 'Recommendations', recommendations: x.split(',')});
        });
      }
      getRecs([searched]);

    
});

module.exports = router;
