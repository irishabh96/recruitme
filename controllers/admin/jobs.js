var express = require('express');
var router = express.Router();

var Jobs = require('../../models/Jobs');
var User = require('../../models/User');
/*
* Add jobs
*/
router.route('/add')
	.post(function(req, res){
	req.assert('jobTitle', 'Please check Job Title').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		req.flash('errors', errors);
		return res.redirect('/profile');
	}

	Jobs.create(
		{
			jobTitle: req.body.jobTitle,
			jobDescription: req.body.jobDescription,
			userId: req.body.userId

		}, function(err, createdJob){
			if(err){
				req.flash('info', {msg: 'Something went wrong'});
				res.redirect('/profile');

			}
			else{
				req.flash('success', {msg: 'Job has been created'});
				res.redirect('/profile');
			}
		}
	);
});

router.route('/delete/:id')
	.get(function(req, res){
		if(req.user.type == 'recruiter'){
			Jobs.remove({_id: req.params.id}, function(err, result){
				if(err){
					req.flash('error', {msg: 'Unable to delete' })
					res.redirect('/profile');
				}
				else{
					req.flash('success', {msg: 'Job deleted Successfully'})
					res.redirect('/profile');
				}
			})
		}
	})
router.route('/edit/:id')
	.get(function(req, res){
		if(req.user.type == 'recruiter' ){
			Jobs.findOne({_id: req.params.id}, function(err, result){
				if(result){
					res.json(result)
				}
				else{
					res.redirect('/profile')
				}
			})
		}
	})

	.post(function(req, res){
		Jobs.findOne({_id: req.params.id}, function(err, result){
			if(result){
				result.jobTitle = req.body.jobTitle,
				result.jobDescription = req.body.jobDescription
				result.save(function(err){
					if(err){
						req.flast('error', {msg: 'Unable to edit job'})
						res.redirect('/profile')
					}
					else{
						req.flash('success', {msg: 'Updated Successfully'})
						res.redirect('/profile')
					}
				})
			}
			else{
				req.flash('error', {msg: 'Something went wrong'})
				res.redirect('/profile')
			}
		})
	});

/*
close and open jobs
*/


router.route('/deactivate/:id')
	.get(function(req, res){
		if(req.user.type == 'recruiter'){
			Jobs.findOne({_id: req.params.id}, function(err, result){
				if(result){
					result.jobStatus = false;
					result.save(function(err){
						if(err){
							req.flash('error', {msg: 'Unable to deactivate the job'});
							res.redirect('/profile');
						}
						else{
							req.flash('success', {msg: 'Job deactivated Successfully'});
							res.redirect('/profile');
						}
					});
				}
			})
		}
	});

router.route('/activate/:id')
	.get(function(req, res){
		if(req.user.type == 'recruiter'){
			Jobs.findOne({_id: req.params.id}, function(err, result){
				if(result){
					result.jobStatus = true;
					result.save(function(err){
						if(err){
							req.flash('error', {msg: 'Unable to activate the job'});
							res.redirect('/profile');
						}
						else{
							req.flash('success', {msg: 'Congratulations! Job activated'});
							res.redirect('/profile');
						}
					})
				}
			})
		}
	})

module.exports = router;
