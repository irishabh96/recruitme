/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment');
const _ = require('underscore');
const helpers = require('./helpers/helpers');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Load main app config.
 */
const config = require('./config/main');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/frontend/home');
const adminController = require('./controllers/admin/home');
const userController = require('./controllers/admin/user');
const apiController = require('./controllers/admin/api');
const contactController = require('./controllers/admin/contact');
const userPreferenceCandidate = require('./controllers/admin/preference-candidate');
const userPreferenceRecruiter = require('./controllers/admin/preference-recruiter');
const userProfileData = require('./controllers/admin/profile');
const experienceController = require('./controllers/admin/experience');
const educationController = require('./controllers/admin/education');
const jobsController = require('./controllers/admin/jobs');
const messagesController = require('./controllers/admin/messages');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

// underscore
app.locals._ = _;
app.locals.helpers = helpers;
app.locals.config = config;

/**
 * Connect to MongoDB.
 */

//console.log(process.env.URL_TEST)
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
	console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
	process.exit();
});

/**
 * Express configuration.
 */
app.set('config', config);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(expressStatusMonitor());
app.use(compression());
app.use(
	sass({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public')
	})
);
app.use(logger('dev'));
app.use(
	bodyParser.json({
		extended: false,
		parameterLimit: 10000,
		limit: 1024 * 1024 * 10
	})
);
app.use(
	bodyParser.urlencoded({
		extended: false,
		parameterLimit: 10000,
		limit: 1024 * 1024 * 10
	})
);

app.use(
	expressValidator({
		customValidators: {
			accountTypeCheck: function(value) {
				if (value == 'recruiter') {
					return 1;
				} else if (value == 'candidate') {
					return 1;
				} else {
					return 0;
				}
			},
			gte: function(param1, param2) {
				return param1 >= param2;
			},
			isNonCorporate: function(email, type) {
				if (type == 'recruiter') {
					const provider = email.match(/@[\w.]+/i)[0];
					if (
						provider == '@gmail.com' ||
						provider == '@yahoo.com' ||
						provider == '@hotmail.com' ||
						provider == '@outlook.com'
					) {
						return 0;
					}
				}
				return 1;
			}
		}
	})
);
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET,
		store: new MongoStore({
			url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
			autoReconnect: true
		})
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	if (req.path === '/profile/api/upload') {
		next();
	} else {
		lusca.csrf()(req, res, next);
	}
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (
		!req.user &&
		req.path !== '/login' &&
		req.path !== '/signup' &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.path;
	} else if (req.user && req.path == '/account') {
		req.session.returnTo = req.path;
	}
	next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */

//app.use('/', homeController);

app.use('/', homeController, userController);
app.use('/preference', userPreferenceCandidate);
app.use('/profile', userProfileData);
app.use('/preference/recruiter', userPreferenceRecruiter);

app.use('/profile/jobs', jobsController);
app.use('/profile/experience', experienceController);
app.use('/profile/education', educationController);

app.use('/profile/messages', messagesController);

/**
 * API's
 */
// app.get('/api', apiController.getApi);
// app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);

/**
 * OAuth authentication routes. (Sign in)
 */
// app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
// app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));

	console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
