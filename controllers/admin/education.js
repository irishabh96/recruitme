var express = require('express');
var router = express.Router();

var User = require('../../models/User');

router.route('/add').post(function(req, res) {
	req.assert('schoolName', 'School Name Cannot be blank').notEmpty();
	req.assert('startMonth', 'Start Month cannot be blank').notEmpty();
	req.assert('startYear', 'Please Check Start year').notEmpty().isInt();
	if (!req.body.isCurrent) {
		req.assert('endMonth', 'End Month Cannot be blank').notEmpty();
		req.assert('endYear', 'Please check End year').notEmpty().isInt();
	}
	req.assert('degree', 'Degree Cannot be empty').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		req.flash('errors', errors);
		return res.redirect('/profile');
	}

	User.findOne({ _id: req.user.id }, function(err, result) {
		if (err) {
			return;
			console.log(err);
		}
		console.log(req.user);
		if (result) {
			var valuePoints = req.body.valuePoints.filter(function(e) {
				return e;
			});

			result.education.push({
				schoolName: req.body.schoolName,
				time: {
					startMonth: req.body.startMonth,
					startYear: req.body.startYear,
					endMonth: req.body.endMonth,
					endYear: req.body.endYear
				},
				degree: req.body.degree,
				valuePoints: valuePoints,
				isCurrent: req.body.isCurrent
			});

			result.save(function(err) {
				if (err) {
					req.flash('info', { msg: 'Unsuccessfull! ' });
					res.redirect('/profile');
				} else {
					req.flash('success', { msg: 'Success! Your education has been added' });
					res.redirect('/profile');
				}
			});
		} else {
		}
	});
});

router.route('/delete/:id').get(function(req, res) {
	User.findOneAndUpdate(
		{
			'education._id': req.params.id
		},
		{
			$pull: {
				education: { _id: req.params.id }
			}
		},
		function(err, doc) {
			req.flash('success', { msg: 'Your education has been deleted' });
			res.redirect('/profile');
		}
	);
});

router
	.route('/edit/:id')
	.get(function(req, res) {
		User.findOne({ 'education._id': req.params.id }, function(err, result) {
			if (result) {
				let resultarray = [];
				resultarray = result.education.filter(function(el) {
					return el.id == req.params.id;
				});
				res.json(resultarray[0]);
			}
		});
	})
	.post(function(req, res) {
		req.assert('name', 'school name cannot be blank').notEmpty();
		req.assert('startMonth', 'starting month cannot be blank').notEmpty();
		req.assert('startYear', 'please check start year').notEmpty().isInt();
		if (!req.body.isCurrent) {
			req.assert('endMonth', 'ending month cannot be blank').notEmpty();
			req.assert('endYear', 'please check end year').notEmpty().isInt();
		}
		req.assert('degree', 'degree cannot be empty').notEmpty();

		var errors = req.validationErrors();

		if (errors) {
			req.flash('errors', errors);
			return res.redirect('/profile');
		}

		var valuePoints = req.body.valuePoints.filter(function(e) {
			return e;
		});

		User.findOne({ 'education._id': req.params.id }, function(err, result) {
			if (err) {
				req.flash('info', { msg: 'UnSuccessfull!' });
				res.redirect('/profile');
				console.log(err);
			}

			if (result) {
				result.education.push({
					schoolName: req.body.name,
					time: {
						startMonth: req.body.startMonth,
						startYear: req.body.startYear,
						endMonth: req.body.endMonth,
						endYear: req.body.endYear
					},
					degree: req.body.degree,
					valuePoints: valuePoints,
					isCurrent: req.body.isCurrent
				});

				result.save(function(err) {
					if (err) {
						req.flash('info', { msg: 'Unsuccessfull!' });
						console.log(err);
						res.redirect('/profile');
					} else {
						User.findOneAndUpdate(
							{
								'education._id': req.params.id
							},
							{
								$pull: {
									education: { _id: req.params.id }
								}
							},
							function(err, doc) {
								req.flash('success', { msg: 'Education successfully edited' });
								res.redirect('/profile');
							}
						);
					}
				});
			} else {
				req.flash('error', { msg: 'Something went wrong' });
				res.redirect('/profile');
				console.log(err);
			}
		});
	});

module.exports = router;
