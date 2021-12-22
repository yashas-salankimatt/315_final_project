var express = require('express');
var router = express.Router();
const port = process.env.PORT || 3000

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Musworks' });
});

router.get('/route/:path', function(req, res, next) {
  res.render('index', { title: 'Musworks', directory: req.params.path.replace(/\\/g, '%5C').trim()});
});
module.exports = router;
