var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('api/index', {
		title: 'Home'
	});
});

module.exports = router;
