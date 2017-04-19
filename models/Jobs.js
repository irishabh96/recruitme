var mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({

	jobTitle: String,
	jobType: String,
	jobDescription: String,
	jobStatus: { type: Boolean, default: true},
	userId: String,
	candidateId: Array,
	preferences: {
      industry: Array,
      functions: Array,
      experience: Number,
      managementExperience: Number,
      location: Array,
      typeOfEmp: Array,
      typeOfJob: Array,
      companySize: Array,
      jobSeekingStatus: String,
      compensation : {
          salaryType: String,
          salaryAmount: Number
      },
  lastActive: String
  }

});

const Job = mongoose.model('Jobs', jobsSchema);

module.exports = Job;