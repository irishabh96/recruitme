var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/'})

var Jobs = require('../../models/Jobs');
var User = require('../../models/User');
var config = require('../../config/main');
var passportConfig = require('../../config/passport');
var moment = require('moment');
var regex = /@+[a-z]\w+(.[a-z]+\.[a-z]+)/g;
var _ = require('underscore');

router.route('/search/:id')
	.get(function(req,res){
		if(req.user.type == 'recruiter'){
			Jobs.find({userId: req.user.id}, function(err, result){
				if(result){
					let dataArray = [];
						dataArray = result.filter(function(n){
							return n._id == req.params.id
						})

						let openjobs = [];
						openjobs = result.filter(function(m){
							return m.jobStatus == true;
						});

						let selectedJob = [];
						selectedJob = result.filter(function(p){
							return p._id == req.params.id
						})


						if (selectedJob){
							jobPreference = selectedJob[0];

							var companySize = jobPreference.preferences.companySize,
		                	industry = jobPreference.preferences.industry,
		                	functions = jobPreference.preferences.functions,
		                	managementExperience = jobPreference.preferences.managementExperience,
		                	location = jobPreference.preferences.location,
							experience = jobPreference.preferences.experience,
							typeOfJob = jobPreference.preferences.typeOfJob,
							typeOfEmp = jobPreference.preferences.typeOfEmp,
							jobSeekingStatus = jobPreference.preferences.jobSeekingStatus,
							salaryType = jobPreference.preferences.compensation.salaryType,
							salaryAmount = jobPreference.preferences.compensation.salaryAmount,
							lastActive = jobPreference.preferences.lastActive;

						}
						var values = [];

								if(industry[0]){
										values.push({'preferences.industry': {$in: industry} })
									}
								if(functions[0]){
					                	values.push({'preferences.functions': { $in: functions} })
					                }
					            if(experience){
					            		values.push({'preferences.experience': { $gte: experience } })
					            	}
					            if(managementExperience){
					                	values.push({'preferences.managementExperience': { $gte: managementExperience } })
					                }
					            if(location[0]){
					                	values.push({'preferences.location': { $in: location } })
					                }
					            if(typeOfEmp[0]){
					                	values.push({'preferences.typeOfEmp': { $in: typeOfEmp } })
					                }
				                if(typeOfJob[0]){
				                	values.push({'preferences.typeOfJob': { $in: typeOfJob } })
				                	}
								if(companySize[0]){
					                	values.push({'preferences.companySize': { $in: companySize} })
					                }
					            if(jobSeekingStatus){
					                	values.push({'preferences.jobSeekingStatus': jobSeekingStatus})
					                }
					            if(salaryType){
					                	values.push({'preferences.compensation.salaryType': salaryType})
					                }
					            if(salaryAmount){
					                values.push({'preferences.compensation.salaryAmount': {	$lte: salaryAmount } })
					            }
				                if(lastActive){
				                	values.push({'lastActive': { $gt:  moment().subtract(lastActive, 'hours') } })
				                }
				                values.push({'profileStatus': true})

						values = values.filter(function(n){
							return n;
						})
						console.log(values)
						// if(!values.length > 0){
						// 	values.push({})
						// }

						User.find({type: 'candidate',
			                $and: values
		                },function(err, obj2){
		                    if(err || !obj2.length > 0){
		                    	req.flash('info', {msg:'No candidates with such preferences'})
		                    	res.render('admin/recruiter/search-tab', {
									title: 'Search',
									selectedJob: selectedJob[0],
									errormsg: 'No such user',
									jobData: openjobs,
									config: config,
									pageName: 'Search Candidate',
								});
		                    }
		                    else{

			                   obj2 = obj2.filter(function(n){

                                   if(n.blockList && n.blockList.length > 0){
                                       var nameParts = req.user.email.split("@");
                                       var emailProvider = '@'+nameParts[1];
                                       if(_.contains(n.blockList, emailProvider)){
                                           console.log("yes");
                                           return false;
                                       }else{
                                           return true;
                                       }
                                   }
                                   else{
                                       return true;
                                   }
			                   		//return n.blockList !== n.email.match(regex)

			                   });

		                    	currentPage = 1;
		                    	if (typeof req.query.page !== 'undefined') {
									currentPage = +req.query.page;

								}

		                    	pageCount = Math.ceil(obj2.length/10);


			                    res.render('admin/recruiter/search-tab', {
									title: 'Search',
									selectedJob: selectedJob[0],
									profileData: obj2,
									jobData: openjobs,
									data: dataArray[0],
									config: config,
									pageName: 'Search Candidate',
									pageCount: pageCount,
									currentPage: currentPage

								});

		                    }

						}).skip((req.query.page-1)*10+1).limit(req.query.page*10);
					}
			})
		}
});

router.route('/search')
	.get(function(req,res){
		Jobs.find({userId: req.user.id}, function(err, result){
			let openjobs = [];
			openjobs = result.filter(function(n){
				return n.jobStatus == true;
			});
			res.render('admin/recruiter/search-tab', {
				title: 'title',
				jobData: openjobs,
				config: config,
				pageName: 'Search Candidate'
			});
		})
});

router.route('/saved')
	.get(function(req, res){
		Jobs.find({userId: req.user.id}, function(err, result){

			let openjobs = [];
			openjobs = result.filter(function(n){
				return n.jobStatus == true;
			});


			res.render('admin/recruiter/save-candidate',{
				title: 'Saved Candidates',
				jobData: openjobs,
				config: config,
				pageName: 'Saved Candidate'
			})
	})
})

router.route('/saved/:id')
	.get(function(req,res){
		Jobs.find({userId: req.user.id}, function(err, result){
			if(err){
				res.redirect('/profile/search')
			}
			else{

				let selectedJob = [];
				selectedJob = result.filter(function(p){
					return p._id == req.params.id
				});

				let dataArray = [];
				dataArray = result.filter(function(p){
					return p._id == req.params.id
				});

				let savedUser = [];
				selectedJob[0].candidateId.forEach(function(item, index){
					savedUser.push(item.id)
				})

				let openjobs = [];
				openjobs = result.filter(function(m){
					return m.jobStatus == true;
				});

				User.find({type: 'candidate'},
				  	function(err, obj){
				  		if(err){

				  			req.flash('error', {msg: 'Unable to fetch'})
				  			res.redirect('/profile/search')
				  		}
				  		else{

				  			res.render('admin/recruiter/save-candidate', {
				  				title: 'Saved Candidates',
				  				selectedJob: selectedJob[0],
				  				jobData: openjobs,
				  				data: dataArray[0],
				  				config: config,
				  				profileData: obj,
				  				pageName: 'Saved Candidate'
				  			})
				  		}
					}).skip((req.query.page-1)*10+1).limit(req.query.page*10)
				}
			})
	});


// res.render('admin/recruiter/save-candidate', {
// 					title: 'title',
// 					selectedJob: 'selectedJob',
// 					jobData: ''

// 				})


router.route('/save/candidate/:jobId/:candidateId')
	.get(function(req, res){
		Jobs.findOne({_id: req.params.jobId}, function(err, result){
			if(err){
				req.flash('error', {msg: 'Something went wrong'})
				res.redirect('/search')
			}
			else{
				let n = req.params.jobId;
				result.candidateId.push(req.params.candidateId);
				result.save(function(err){
					if(err){
						req.flash('error', {msg: 'Unable to save candidate'})
						res.redirect('/search')
					}
					else{
						req.flash('success', {msg: 'Candidate saved!'})
						res.redirect('/profile/search/'+n)
					}
				})
			}
		})
	});


router.route('/remove/candidate/:jobId/:candidateId')
	.get(function(req, res){
		Jobs.findOneAndUpdate({_id: req.params.jobId},
			{ '$pull': { 'candidateId': req.params.candidateId } }, function(err, obj){
				if(err){
					req.flash('error', {msg: 'Unable to remove candidate'})
					res.redirect('/profile/search')
				}else{
					let n = req.params.jobId
					req.flash('success', {msg: 'Candidate Removed!'})
					res.redirect('/profile/search/'+n)
				}
			}
		);
});

router.route('/remove/saved-candidate/:jobId/:candidateId')
	.get(function(req, res){
		Jobs.findOneAndUpdate({_id: req.params.jobId},
			{ '$pull': { 'candidateId': req.params.candidateId } }, function(err, obj){
				if(err){
					req.flash('error', {msg: 'Unable to remove candidate'})
					res.redirect('/profile/saved')
				}else{
					let n = req.params.jobId
					req.flash('success', {msg: 'Candidate removed!'})
					res.redirect('/profile/saved/'+n)
				}
			}
		);
});


/*
*Image upload
*/
var imgURL;
var random = Math.random().toString(36).substring(7);
var imgUpload = multer({
		storage: multer.diskStorage({
    		destination: function (req, file, callback) {
    			callback(null, 'public/uploads/');
    		},
    		filename: function (req, file, callback) {
    			callback(null, random + '-' + file.originalname);
    			imgURL = random + '-' + file.originalname;

    		}
    	})
	}).single('profileImage');

router.post('/api/upload', imgUpload , function(req, res){
	var picture = "uploads/"+imgURL;
	if(picture){
		User.findOne({_id: req.user.id}, function(err, result){
			if(result){
				result.profile.picture = picture
			}

			result.save(function(err){
				if(err){
					req.flash('error', {msg: 'Unable to upload profile picture'});
					res.redirect('/profile');

				}
				else{
					req.flash('success', {msg: 'Profile picture successfully uploaded'});
					res.redirect('/profile');
				}
			})
		})
	}
})






/*
* findind search criteria
*/

// router.get('/explore/:id',function(req, res) {
// 	var candidatePreference;
// 	var recruiterPreference;


//     if(req.user.type == 'recruiter'){
//         Jobs.findOne({_id: req.params.id}, function(err, obj1){
//             if(err) { console.log('No Such user') }

//             else{
//             recruiterPreference = obj1

//                 var companySize = recruiterPreference.preferences.companySize,
//                 	industry = recruiterPreference.preferences.industry,
//                 	functions = recruiterPreference.preferences.functions,
//                 	managementExperience = recruiterPreference.preferences.managementExperience,
//                 	location = recruiterPreference.preferences.location,
// 					experience = recruiterPreference.preferences.experience,
// 					typeOfJob = recruiterPreference.preferences.typeOfJob,
// 					typeOfEmp = recruiterPreference.preferences.typeOfEmp,
// 					jobSeekingStatus = recruiterPreference.preferences.jobSeekingStatus,
// 					salaryType = recruiterPreference.preferences.compensation.salaryType,
// 					salaryAmount = recruiterPreference.preferences.compensation.salaryAmount
// 					// console.log(obj1)
// 					// if(industry){
// 					// array.push({'preferences.industry': {$in: industry} })
// 					// }
// 					User.find({type: 'candidate',
// 	                     $and: [
// 	                     {'preferences.industry': {$in: industry} },
// 	                     {'preferences.functions': { $in: functions} },
// 	                     {'preferences.experience': experience},
// 	                     {'preferences.managementExperience': managementExperience},
// 	                     {'preferences.location': { $in: location } },
// 	                     {'preferences.typeOfEmp': { $in: typeOfEmp } },
// 	                     {'preferences.typeOfJob': { $in: typeOfJob } },
// 	                     {'preferences.companySize': { $in: companySize} },
// 	                     {'preferences.jobSeekingStatus': jobSeekingStatus},
// 	                     {'preferences.compensation.salaryType': salaryType},
// 	                     {'preferences.compensation.salaryAmount': salaryAmount}

// 	                     ]
//                  }
//                     if(err){ console.log('No such user') }

// 					else{
// 						// console.log(obj2)
// 						Jobs.find({userId: req.user.id}, function(err, resultjobs){
// 								// let openjobs = [];
// 								// openjobs = resultjobs.filter(function(m){
// 								// 	return m.jobStatus = true;
// 								// });
// 								res.render('admin/recruiter/search-tab', {
// 								data: obj2,
// 								title: 'title',
// 								currentJob: obj1,
// 								jobData: resultjobs,
// 								config: config
// 							})

// 						})
// 					}
//                 })
//             }
//         })
//     }
// });

router.post('/company/block', function(req, res){
    if(req.user.type == 'candidate'){
        var blockList = req.body.blockList.filter(function(e){return e});

        User.findOne({_id: req.user.id}, function(err, result){
            if(err){
                req.flash('Error', {msg: 'Something went wrong'})
                res.redirect('/profile')
            } else{
                result.blockList = blockList;
                result.save(function(err){
                    if(err){
                        req.flash('error', {msg: 'Something went wrong'})
                        res.redirect('/profile')
                    }
                    else{
                        req.flash('info', {msg: 'Your block list has been saved'})
                        res.redirect('/profile')
                    }
                })
            }
        })
    }
});


module.exports = router;
