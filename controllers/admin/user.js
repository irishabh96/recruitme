var express = require('express');
var router = express.Router();

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../../models/User');
const Jobs = require('../../models/Jobs');
const passportConfig = require('../../config/passport');
const config = require('../../config/main');
const moment = require('moment');
const _ = require('underscore');

let transporter = nodemailer.createTransport(config.smtp);

/**
* GET /login
* Login page.
*/

router.get('/login', function(req, res) {
    // if (req.user) {
    //     return res.redirect('/');
    // }
    res.render('admin/login', {
        title: 'Login'
    });
});

/**
* POST /login
* Sign in using email and password.
*/
router.post('/login', function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/login');
        }
        if (!user.isActivated) {
            req.flash('errors', { msg: 'Looks like your email is not verified. Please check your email and click on the verification link.' });
            sendActivationEmail(user);
            return res.redirect('/login');
        }
        else{
            req.logIn(user, (err) => {
                if (err) { return next(err); }
                req.flash('success', { msg: 'Success! You are logged in.' });
                res.redirect('/profile');
                // Save login time
                User.findById(req.user.id, (err, user, next) => {
                    if (err) { return next(err); }
                    user.lastActive = new Date();
                    user.save((err) => {
                        if (err) { return next(err); }
                    });
                });
            });
        }
    })(req, res, next);
});


/**
* GET /activate
* User activation route
*/

router.get('/activate/:email/:activationHash', function(req, res) {
    if (!req.params.email || !req.params.activationHash) {
        return res.redirect('/');
    }

    User.findOne({ email: req.params.email }, (err, usr, next) => {
        if (err) { return next(err); }
        if (usr) {
            if(!usr.isActivated){
                if(req.params.activationHash == usr.activationHash){
                    usr.isActivated = true;
                    usr.save((err) => {
                        if (err) { next(err); }
                        req.flash('success', { msg: 'Account activated.' });
                        return res.redirect('/login');
                    });
                }
                else{
                    req.flash('errors', { msg: 'Your account could not be activated please. Contact support.' });
                    return res.redirect('/login');
                }
            } else {
                req.flash('info', { msg: 'Your account is already active.' });
                return res.redirect('/login');
            }
        }
    });

});

/**
* GET /logout
* Log out.
*/
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

/**
* GET /signup-select
* Signup page selection.
*/
router.get('/signup-select', function(req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('admin/signup-select', {
        title: 'Create Account'
    });
});

/**
* GET /signup
* Signup page for candidates.
*/
router.get('/signup', function(req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('admin/signup-candidate', {
        title: 'Create Account'
    });
});

/**
* GET /signup
* Signup page for Recruiters.
*/
router.get('/signup-recruiter', function(req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('admin/signup-recruiter', {
        title: 'Create Account'
    });
});

/**
* POST /signup
* Create a new local account.
*/
router.post('/signup', function(req, res, next) {
    req.assert('name', 'Name is not valid').isLength({min:2, max: 100});
    req.assert('type', 'Please check account type').notEmpty().accountTypeCheck();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Please use corporate email.').isNonCorporate(req.body.type, req.body.email);
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        if(req.body.type == 'candidate'){
            return res.redirect('/signup');
        }
        else{
            return res.redirect('/signup-recruiter');
        }
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password,
        type: req.body.type,
        profile :{
            name: req.body.name
        },
        activationHash: crypto.randomBytes(32).toString('hex')
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            if(req.body.type == 'candidate'){
                return res.redirect('/signup');
            }
            else{
                return res.redirect('/signup-recruiter');
            }
        }
        user.save((err) => {
            if (err) { return next(err); }
            sendActivationEmail(user);
            req.flash('info', { msg: 'Please check your email and click on the verification link.' });
            return res.redirect('/login');
            // req.logIn(user, (err) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.redirect('/profile');
            // });
        });
    });
});

/**
 * Send activation Email.
 */
let sendActivationEmail = (user) => {
    const mailOptions = {
        to: user.email,
        from: 'support@recruitme.co',
        subject: 'Recruit Me: Please click on link to activate your account',
        text: `${user.profile.name},\n\n Thank you for signing up for Recruit Me! Please click the following link to activate your account:\n\n${config.url}/activate/${user.email}/${user.activationHash}\n\n-Recruit Me\n\n`
    };
    transporter.sendMail(mailOptions, (err) => {
        if(err) console.log(err);
    });
};

/**
* GET /account
* Profile page.
*/



router.get('/profile', passportConfig.isAuthenticated, function(req, res, next){
    if(req.user.profileStatus == true) next('route');

    else next()

}, function(req, res, next){
    res.redirect('/account/activate')
})

router.get('/profile', passportConfig.isAuthenticated, function(req, res) {

    if(req.user.type == 'candidate'){
        User.findOne({_id: req.user.id}, function(err, result){
                res.render('admin/candidate-home', {
                title: 'Profile',
                data: result,
                config: config,
                tab: 'profile'
                });
        });

    } else if(req.user.type == 'recruiter'){
         User.findOne({_id: req.user.id}, function(err, result){
            if(result){
                Jobs.find({userId: req.user.id}, function(err, result1){

                    let closedJobs = [];
                    closedJobs = result1.filter(function(n){
                        return n.jobStatus == false;
                    });

                    let openJobs = [];
                    openJobs = result1.filter(function(m){
                        return m.jobStatus == true;
                    });

                    res.render('admin/recruiter-home', {
                        title: 'Profile',
                        jobData: openJobs,
                        profiledata: result,
                        config: config,
                        closedJobs: closedJobs,
                        pageName: 'Profile'
                     });
                });
            }
        })

    }
    else{
        req.flash('errors', { msg: 'Some problem with your account. Please contact support.' });
        return res.redirect('/');
    }
});

/**
* POST /account/profile
* Update profile information.
*/
router.post('/account/profile', passportConfig.isAuthenticated, function(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                    return res.redirect('/account');
                }
                return next(err);
            }
            req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/account');
        });
    });
});

/**
* Get /account/password
* Update current password.
*/
router.get('/account/password', passportConfig.isAuthenticated, function(req, res) {
    res.render('admin/change-password', {
        title: 'Change Password'
    });
});

/**
* POST /account/password
* Update current password.
*/
router.post('/account/password', passportConfig.isAuthenticated, function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account/password');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/profile');
        });
    });
});

router.get("/preferences/location", passportConfig.isAuthenticated, function(req, res) {
    User.findOne({_id: req.user.id}, function(err, result){
            res.render('admin/location-select', {
            title: 'Profile',
            data: result,
            config: config
            });
    });
})

//
router.post("/account/location", passportConfig.isAuthenticated, function(req, res, next) {
    console.log(req.body);
    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.preferences.location = req.body.location instanceof Array ? req.body.location : [req.body.location];
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Location Has been Updated.' });
            res.redirect('/profile');
        });
    });
})
/**
* Get /account/company-block-list
* Company Block List.
*/
router.get('/account/company-block-list', passportConfig.isAuthenticated, function(req, res, next) {
    if(req.user.type == 'candidate'){
        User.findOne({_id: req.user.id}, function(err, result){
             res.render('admin/company-block-list', {
             title: 'Company Block List',
             blockList: result.blockList
             });
        })

    }
    else{
        res.redirect('/');
    }
});




/**
* Get /account/delete
* Delete user account.
*/
router.get('/account/delete', passportConfig.isAuthenticated, function(req, res, next) {
    res.render('admin/delete-account', {
        title: 'Account Management',
        status: 'true',
        message: 'Potential employers will not be able to search for your profile. Are you sure you want to deactivate?'
    });
});

router.get('/account/activate', passportConfig.isAuthenticated, function(req, res, next) {
    res.render('admin/delete-account', {
        title: 'Account Management',
        status: 'false',
        message: 'You profile will be visible to potential employers. Are you sure you want to activate?'
    });
});

/**
* POST /account/delete
* Delete user account.
*/
router.post('/account/delete', passportConfig.isAuthenticated, function(req, res, next) {
    User.findOne({_id: req.user.id}, function(err, result){
        if(result){
            result.profileStatus = false;
            result.save(function(err){
                if(err){
                    req.flash('error', {msg: "Unable to deactivate your account"})
                    req.redirect('/')
                }
                else{
                    req.logout();
                    req.flash('info', { msg: 'Your account has been deactivated.' });
                    res.redirect('/');
                }
            })
        }
        else{
            req.flash('error',{msg:'Something went wrong'})
            req.redirect('/')
        }
    })
});


router.post('/account/activate', passportConfig.isAuthenticated, function(req, res){
    User.findOne({_id: req.user.id}, function(err, result){
        if(result){

            result.profileStatus = true;
            result.save(function(err){
                if(err){
                    req.flash('error', {msg: "Unable to activate your account"})
                    req.redirect('/')
                }
                else{
                    req.flash('info', { msg: 'Your account has been activated.' });
                    res.redirect('/profile');
                }
            })
        }
        else{
            req.flash('error',{msg:'Something went wrong'})
            req.redirect('/')
        }
    })
});
/**
* GET /account/unlink/:provider
* Unlink OAuth provider.
*/
// router.get('/account/unlink/:provider', passportConfig.isAuthenticated,function(req, res, next) {
//     const provider = req.params.provider;
//     User.findById(req.user.id, (err, user) => {
//         if (err) { return next(err); }
//         user[provider] = undefined;
//         user.tokens = user.tokens.filter(token => token.kind !== provider);
//         user.save((err) => {
//             if (err) { return next(err); }
//             req.flash('info', { msg: `${provider} account has been unlinked.` });
//             res.redirect('/account');
//         });
//     });
// });

/**
* GET /reset/:token
* Reset Password page.
*/
router.get('/reset/:token', function(req, res, next){
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('/forgot');
        }
        res.render('admin/reset', {
            title: 'Password Reset'
        });
    });
});

/**
* POST /reset/:token
* Process the reset password request.
*/
router.post('/reset/:token', function(req, res, next){
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    async.waterfall([
        function resetPassword(done) {
            User
            .findOne({ passwordResetToken: req.params.token })
            .where('passwordResetExpires').gt(Date.now())
            .exec((err, user) => {
                if (err) { return next(err); }
                if (!user) {
                    req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                    return res.redirect('back');
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.save((err) => {
                    if (err) { return next(err); }
                    req.logIn(user, (err) => {
                        done(err, user);
                    });
                });
            });
        },
        function sendResetPasswordEmail(user, done) {
            const mailOptions = {
                to: user.email,
                from: 'support@recruitme.co',
                subject: 'Your Recruit Me password has been changed',
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('success', { msg: 'Success! Your password has been changed.' });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

/**
* GET /forgot
* Forgot Password page.
*/
router.get('/forgot', function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }
    res.render('admin/forgot', {
        title: 'Forgot Password'
    });
});


/**
* POST /forgot
* Create a random token, then the send user an email with a reset link.
*/
router.post('/forgot', function(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    async.waterfall([
        function createRandomToken(done) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function setRandomToken(token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (err) { return done(err); }
                if (!user) {
                    req.flash('errors', { msg: 'Account with that email address does not exist.' });
                    return res.redirect('/forgot');
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        function sendForgotPasswordEmail(token, user, done) {
            const mailOptions = {
                to: user.email,
                from: 'support@recruitme.co',
                subject: 'Reset your password on Recruit Me',
                text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/reset/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect('/forgot');
    });
});

module.exports = router;
