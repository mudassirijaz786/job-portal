const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  summary: {
    type: String,
    required: true,
    default: "",
  },
  projects: [
    {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  experiences: [
    {
      jobTitle: {
        type: String,
      },
      company: {
        type: String,
      },
      industry: {
        type: String,
      },
      localtion: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  educations: [
    {
      instituteName: {
        type: String,
      },
      programme: {
        type: String,
      },
      major: {
        type: String,
      },
      completionYear: {
        type: Number,
      },
    },
  ],
  skills: [
    {
      name: {
        type: String,
      },
      level: {
        type: String,
      },
    },
  ],
  languages: [
    {
      name: {
        type: String,
      },
      level: { type: String },
    },
  ],
});

const Profile = mongoose.model("Profile", profileSchema);

validateProfile = (profile) => {
  const schema = {
    // all validations here
  };
  return Joi.validate(profile, schema);
};

validateSkill = (skill) => {
  const schema = {
    name: Joi.string().required(),
    level: Joi.string().required(),
  };
  return Joi.validate(skill, schema);
};

exports.Profile = Profile;
exports.validate = validateProfile;
exports.validateSkill = validateSkill;
