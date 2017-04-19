var express = require('express');

var router = express.Router();

router.get('/admin', function(req, res) {
    res.render('index', {
        title: 'Home'
    });
});


module.exports = router;
