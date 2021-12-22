var express = require('express');
var router = express.Router();
const port = process.env.PORT || 3000

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool', function(req, res, next) {
  res.send('you\'re ');
});

module.exports = router;
