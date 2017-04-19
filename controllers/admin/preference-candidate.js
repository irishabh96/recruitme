var express = require('express');
var router = express.Router();

const User = require('../../models/User');

/*
 * All jobs api's
 */
require('./jobs');

router.post('/', function(req, res){
    //console.log(req.body);
    //res.json(req.body);

    // req.assert('experience', 'Industry field cannot be left blank').notEmpty();
    // req.assert('functions', 'Functions field cannot be left blank ').notEmpty();
    // req.assert('experience', 'Experience field cannot be left blank').notEmpty();
    // req.assert('managementExperience', 'Management Experience cannot be left blank').notEmpty();
    // req.assert('location', 'Location must be selected').notEmpty();
    // req.assert('typeOfEmp', 'Employment type cannot be blank').notEmpty();
    // req.assert('typeOfJob', 'Type of job cannot be blank').notEmpty();
    // req.assert('companySize', 'Size of company cannot be blank').notEmpty();
    // req.assert('jobStatus', 'Please select your job status').notEmpty();
    // req.assert('salaryAmount', 'Please enter minimum salary').notEmpty();
    // req.assert('salaryType', 'Please select payment type').notEmpty();

    // var errors = req.validationErrors();
    // if (errors) {
    //     req.flash('errors', errors);
    //     return res.redirect('/profile');
    // }

    User.findOne({_id: req.user.id}, function(err, result){

        if(result){

            var industry = req.body.industry;
            if(industry){
                if(Array.isArray(industry) && industry.length > 0){
                        result.preferences.industry = industry;
                    }
                else{
                    result.preferences.industry = [industry];
                }
            }
            else{
                result.preferences.industry = [];
            }

            var functions = req.body.functions;
            if(functions){
                if(Array.isArray(functions) && functions.length > 0){
                        result.preferences.functions = functions;
                    }
                else{
                    result.preferences.functions = [functions];
                }
            }
            else{
                result.preferences.functions = [];
            }


            var location = req.body.location;
            if(location){
                if(Array.isArray(location) && location.length > 0){
                        result.preferences.location = location;
                    }
                else{
                    result.preferences.location = [location];
                }
            }
            else{
                result.preferences.location = [];
            }


            var typeOfEmp = req.body.typeOfEmp;
            if(typeOfEmp){
                if(Array.isArray(typeOfEmp) && typeOfEmp.length > 0){
                        result.preferences.typeOfEmp = typeOfEmp;
                    }
                else{
                    result.preferences.typeOfEmp = [typeOfEmp];
                }
            }
            else{
                result.preferences.typeOfEmp = [];
            }


            var typeOfJob = req.body.typeOfJob;
            if(typeOfJob){
                if(Array.isArray(typeOfJob) && typeOfJob.length > 0){
                        result.preferences.typeOfJob = typeOfJob;
                    }
                else{
                    result.preferences.typeOfJob = [typeOfJob];
                }
            }
            else{
                result.preferences.typeOfJob = [];
            }

            var companySize = req.body.companySize;
            if(companySize){
                if(Array.isArray(companySize) && companySize.length > 0){
                        result.preferences.companySize = companySize;
                    }
                else{
                    result.preferences.companySize = [companySize];
                }
            }
            else{
                result.preferences.companySize = [];
            }

            if(req.body.experience){
                result.preferences.experience = req.body.experience;
            }

            if(req.body.managementExperience){
            result.preferences.managementExperience = req.body.managementExperience;
            }

            if(req.body.authorization) {
                result.preferences.authorization = req.body.authorization;
            }
		    if(req.body.jobSeekingStatus){
                result.preferences.jobSeekingStatus = req.body.jobSeekingStatus;
            }

            if(req.body.salaryType){
                result.preferences.compensation.salaryType = req.body.salaryType;
            }

            if(req.body.salaryAmount){
                result.preferences.compensation.salaryAmount = req.body.salaryAmount;
            }

            //console.log(result.preferences);


            result.save(function(err){
                if(err){

                    req.flash('info', { msg: 'Unsuccessfull! ' });
                    res.redirect('/profile')
                }
                else{
                    req.flash('success', { msg: 'Success! Preferences has been set.' });
                    res.redirect('/profile');
                }
            })
        }
    })
})

router.get('/', function(req,res){
	User.findOne({_id: req.user.id}, function(err, result){
		res.json(result)
	})
})

module.exports = router;
