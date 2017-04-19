var express = require('express');
var router = express.Router();

var User = require('../../models/User');

/**
  add experience
*/

router.route('/add')
	.post(function(req, res){

		req.assert('companyName', 'Company name cannot be blank').notEmpty();
		req.assert('startMonth', 'Start month cannot be blank').notEmpty();
		req.assert('startYear', 'Please check start year').notEmpty().isInt();

        if(!req.body.isCurrent){
		    req.assert('endMonth', 'End month cannot be blank').notEmpty();
            req.assert('endYear', 'Please check end year').notEmpty().isInt();
        }
		req.assert('posTitle', 'Position cannot be empty').notEmpty();
		var errors = req.validationErrors();

		if(errors){
			req.flash('errors', errors);
			return res.redirect('/profile');
	    }


    	User.findOne({_id: req.user.id}, function(err, result){
    		if(err){
                req.flash('error', {msg: 'Something went wrong'})
                res.redirect('/profile')
    		}

    		if(result){

            var valuePoints = req.body.valuePoints.filter(function(e){return e});

    			result.experience.push({
    				companyName: req.body.companyName,
    				time: {
    					startMonth: req.body.startMonth,
    					startYear: req.body.startYear,
    					endMonth: req.body.endMonth,
    					endYear: req.body.endYear
    				},
    				title: req.body.posTitle,
    				valuePoints: valuePoints,
                    isCurrent: req.body.isCurrent
    			})

    			result.save(function(err){
    				if(err){
    					req.flash('info', { msg: 'Unsuccessfull' });
    					res.redirect('/profile')
    				}
    				else{
    					req.flash('success', { msg: 'Success! your experience is added' });
    					res.redirect('/profile')
    				}
    			});


    		}
    		else{
    			req.flash('info', { msg: 'Unsuccessfull' });
    			res.redirect('/profile');
    			console.log('Nothing Found');
    		}
    	});
});


/*
get and update Data
*/
router.route('/edit/:id')
    .get(function(req, res){
    	User.findOne({'experience._id' : req.params.id},
    	function(err,result) {
    		if(result){

    			let resultarray = [];
    			resultarray = result.experience.filter(function(el){
    				return el.id == req.params.id;
    			});
    			res.json(resultarray[0])
    		}
    	});
    })

    .post(function(req,res){

    		req.assert('companyName', 'Company name cannot be blank').notEmpty();
    		req.assert('startMonth', 'Start month cannot be blank').notEmpty();
    		req.assert('startYear', 'Please check start year').notEmpty().isInt();
            if(!req.body.isCurrent){
    		    req.assert('endMonth', 'End month cannot be blank').notEmpty();
    		    req.assert('endYear', 'Please check end year').notEmpty().isInt();
            }
    		req.assert('title', 'Position cannot be empty').notEmpty();

    		var errors = req.validationErrors();

    		if(errors){
    			req.flash('errors', errors);
    			return res.redirect('/profile');
    		}


    	    var valuePoints = req.body.valuePoints.filter(function(e){return e});

    		User.findOne({'experience._id' : req.params.id}, function(err, result){

    			if(err){
    				req.flash('info', { msg: 'Unsuccessfull!' });
    				res.redirect('/profile');
    			}

    			if(result){

    				result.experience.push({
    					companyName: req.body.companyName,
    					time: {
    						startMonth: req.body.startMonth,
    						startYear: req.body.startYear,
    						endMonth: req.body.endMonth,
    						endYear: req.body.endYear
    					},
    					title: req.body.title,
    					valuePoints: valuePoints,
                        isCurrent: req.body.isCurrent
    				})

    					result.save(function(err){
    						if (err){
    							req.flash('info', { msg: 'Unsuccessfull!' });
    							res.redirect('/profile')
    						}
    						else{
    							User.findOneAndUpdate({
    									'experience._id' : req.params.id
    								},
    								{
    									'$pull': {
    										'experience': { _id : req.params.id }
    									}
    								},
    								function(err,doc) {
    									req.flash('success', {msg: 'Experience has been edited'})
    									res.redirect('/profile');
    								}
    							);
    						}
    					})
    			}
    			else{
                    req.flash('error', {msg: 'Something went wrong'})
                    res.redirect('/profile')
    			}
    		})
});


router.route('/delete/:id')
    .get(function(req,res){

    	User.findOneAndUpdate({
    		'experience._id' : req.params.id
    	},
    	{
    		'$pull': {
    			'experience': { _id : req.params.id }
    		}
    	},
    	function(err,doc) {
    		req.flash('success', {msg: 'Your experience has been deleted'})
    		res.redirect('/profile');
    	}
    );
});


module.exports = router;
