var express = require('express');
//const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);

var router = express.Router();

router.get('/', function(req, res) {
    res.render('api/index', {
        title: 'Home'
    });
});

/**
 * GET /api/linkedin
 * LinkedIn API
 */
// router.get('/api/linked', function(req, res, next) {
//   const token = req.user.tokens.find(token => token.kind === 'linkedin');
//   const linkedin = Linkedin.init(token.accessToken);
//   linkedin.people.me((err, $in) => {
//     if (err) { return next(err); }
//     res.send($in);
//     res.render('api/linkedin', {
//       title: 'LinkedIn API',
//       profile: $in
//     });
//   });
// });


module.exports = router;
