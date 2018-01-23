const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userProfileExperienceSchema = new mongoose.Schema({
	companyName: String,
	time: {
		startMonth: String,
		startYear: String,
		endMonth: String,
		endYear: String
	},
	experienceTitle: String,
	title: String,
	valuePoints: { type: Array, default: [] },
	isCurrent: { type: Boolean, default: false }
});

const userProfileEducationSchema = new mongoose.Schema({
	schoolName: String,
	time: {
		startMonth: String,
		startYear: String,
		endMonth: String,
		endYear: String
	},
	degree: String,
	valuePoints: { type: Array, default: [] },
	isCurrent: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
	{
		email: { type: String, unique: true },
		password: String,
		passwordResetToken: String,
		passwordResetExpires: Date,
		linkedin: String,
		tokens: Array,
		type: String,
		profile: {
			name: String,
			gender: String,
			location: String,
			website: String,
			picture: String
		},
		experience: [ userProfileExperienceSchema ],
		education: [ userProfileEducationSchema ],
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
			authorization: String,
			compensation: {
				salaryType: String,
				salaryAmount: Number
			}
		},
		blockList: Array,
		profileStatus: { type: Boolean, default: true },
		lastActive: Date,
		isActivated: { type: Boolean, default: false },
		activationHash: String
	},
	{ usePushEach: true },
	{ timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
	const user = this;
	if (!user.isModified('password')) {
		return next();
	}
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, null, (err, hash) => {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
	if (!size) {
		size = 200;
	}
	if (!this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`;
	}
	const md5 = crypto.createHash('md5').update(this.email).digest('hex');
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
