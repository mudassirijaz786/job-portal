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
        type: String,
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
    _id: Joi.objectId(),
    employee_id: Joi.objectId(),
    summary: Joi.string().required(),
  };

  return Joi.validate(profile, schema);
};

validateSkill = (skill) => {
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().required(),
    level: Joi.string().required(),
  };

  return Joi.validate(skill, schema);
};

validateLanguage = (language) => {
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().required(),
    level: Joi.string().required(),
  };

  return Joi.validate(language, schema);
};

validateProject = (project) => {
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    description: Joi.string().required().max(80),
  };

  return Joi.validate(project, schema);
};

validateExperience = (experience) => {
  const schema = {
    _id: Joi.objectId(),
    jobTitle: Joi.string().required(),
    company: Joi.string().required(),
    industry: Joi.string().required(),
    startDate: Joi.string().required(),
    localtion: Joi.string().required(),
    endDate: Joi.string().required(),
    description: Joi.string().required().max(80),
  };

  return Joi.validate(experience, schema);
};

validateEducation = (experience) => {
  const schema = {
    _id: Joi.objectId(),
    instituteName: Joi.string().required(),
    programme: Joi.string().required(),
    major: Joi.string().required(),
    completionYear: Joi.string().required(),
  };

  return Joi.validate(experience, schema);
};

exports.Profile = Profile;
exports.validateProfile = validateProfile;
exports.validateSkill = validateSkill;
exports.validateLanguage = validateLanguage;
exports.validateProject = validateProject;
exports.validateExperience = validateExperience;
exports.validateEducation = validateEducation;
