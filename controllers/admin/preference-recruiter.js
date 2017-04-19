var express = require('express');
var router = express.Router();

const User = require('../../models/User');
const Jobs = require('../../models/Jobs');

router.post('/:id', function(req, res){
	
 
	Jobs.findOne({_id: req.params.id}, function(err, result){
		if(err){
			req.flash('info', {msg: 'Something went wrong'})
			res.redirect('/profile')
		}
			
		if(result){
				result.preferences.industry = req.body.industry,
				result.preferences.functions = req.body.functions,
				result.preferences.experience = req.body.experience
				result.preferences.managementExperience = req.body.managementExperience,
				result.preferences.location = req.body.location,
				result.preferences.typeOfEmp = req.body.typeOfEmp,
				result.preferences.typeOfJob = req.body.typeOfJob,
				result.preferences.companySize = req.body.companySize,
				result.preferences.jobSeekingStatus = req.body.jobSeekingStatus,
				result.preferences.compensation.salaryType = req.body.salaryType,
				result.preferences.compensation.salaryAmount = req.body.salaryAmount,
				result.preferences.lastActive = req.body.lastActive

            result.save(function(err){
				if(err){
					req.flash('info', {msg: 'Something went wrong'})
					res.redirect('/profile');
				}
				else{
					var redirectLocation = req.params.id
					req.flash('success', {msg:'your preference has been successfully added'})
					res.redirect('/profile/search/'+redirectLocation);
				}
			})
		}
		else{
			req.flash('error', {msg: 'Something went wrong'})
			res.redirect('/profile')
		}
	});
});

router.get('/:id', function(req,res){
	Jobs.findOne({_id: req.params.id}, function(err, result){
		res.json(result)
	});
});

module.exports = router;
