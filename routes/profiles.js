const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const {
  Profile,
  validateSkill,
  validateProfile,
  validateLanguage,
  validateEducation,
  validateProject,
  validateExperience,
} = require("../models/profile");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management
 */

// my profile
/**
 * @swagger
 * /api/profile/me/{id}:
 *  get:
 *    description: Use to request a single employuee
 *    summary:  Use to request a single employee
 *    tags: [Profile]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the employee to get.
 *    responses:
 *      '200':
 *        description: A successful response containg a current profile of employee
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  const profile = await Profile.findOne({ employee_id: req.params.id });
  if (profile) {
    res.json({ data: profile });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }

  res.send(profile);
});

// profile creation
/**
 * @swagger
 *  /api/profile/:
 *  post:
 *    description: Use to set the profile addition
 *    summary:  Use to update the profile
 *    tags: [Profile]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: profile
 *      required: true
 *      description: The profile to add.
 *      schema:
 *        "$ref": "#/definitions/profile"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating profile has been created successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/", auth, async (req, res) => {
  const { error } = validateProfile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = new Profile(
    _.pick(req.body, [
      "employee_id",
      "summary",
      "projects",
      "experiences",
      "educations",
      "languages",
      "skills",
    ])
  );

  await profile.save();
  res.json({ message: "Profile has been saved successfully", data: profile });
});

/**
 * @swagger
 * /api/summary/{id}:
 *  get:
 *    description: Use to request a update summary
 *    summary:  Use to request an update summary
 *    tags: [Profile]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg isAdmin field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the employee to update summary
 *    - in: body
 *      name: summary
 *      description: to update summary
 *      schema:
 *        type: object
 *        required:
 *        - summary
 *        properties:
 *          summary:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response containg summary updation
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/summary/:id", auth, async (req, res) => {
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        summary: req.body.summary,
      },
    },

    { new: true }
  );

  res.json({ message: "Summary has been saved successfully" });
});

// adding project to projects array
/**
 * @swagger
 *  /api/profile/addProject/{id}:
 *  post:
 *    description: Use to set the profile addition
 *    summary:  Use to update the profile
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: project
 *      required: true
 *      description: The project to add.
 *      schema:
 *        "$ref": "#/definitions/project"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating profile has been created successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addProject/:id", auth, async (req, res) => {
  const { error } = validateProject(req.body.project);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },

      {
        $push: {
          projects: req.body.project,
        },
      },

      { new: true }
    );
    res.json({ message: "Project has been saved successfully" });
  }
});

// adding experience to experiences array
/**
 * @swagger
 *  /api/profile/addExperince/{id}:
 *  post:
 *    description: Use to add Experince
 *    summary:  add Experince
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: experience
 *      required: true
 *      description: The experience to add.
 *      schema:
 *        "$ref": "#/definitions/experience"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating experience in profile has been added successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addExperince/:id", auth, async (req, res) => {
  const { error } = validateExperience(req.body.experience);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },

      {
        $push: {
          experiences: req.body.experience,
        },
      },
      { new: true }
    );

    res.json({
      message: "Experience has been saved successfully",
      data: profile,
    });
  }
});

// adding education to educations array
/**
 * @swagger
 *  /api/profile/addEducation/{id}:
 *  post:
 *    description: Use to add education
 *    summary:  add education
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: education
 *      required: true
 *      description: The education to add.
 *      schema:
 *        "$ref": "#/definitions/education"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating addEducation in profile has been added successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addEducation/:id", auth, async (req, res) => {
  const { error } = validateEducation(req.body.education);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },

      {
        $push: {
          educations: req.body.education,
        },
      },

      { new: true }
    );

    res.json({
      message: "Education has been saved successfully",
      data: profile,
    });
  }
});

// adding language to languages array
/**
 * @swagger
 *  /api/profile/addLanguage/{id}:
 *  post:
 *    description: Use to add language
 *    summary:  add language
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: language
 *      required: true
 *      description: The language to add.
 *      schema:
 *        "$ref": "#/definitions/language"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating language in profile has been added successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addLanguage/:id", auth, async (req, res) => {
  const { error } = validateLanguage(req.body.language);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },

      {
        $push: {
          languages: req.body.language,
        },
      },

      { new: true }
    );

    res.json({
      message: "Language has been saved successfully",
      data: profile,
    });
  }
});

// adding skill to skills array
/**
 * @swagger
 *  /api/profile/addSkill/{id}:
 *  post:
 *    description: Use to add skill
 *    summary:  add skill
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: skill
 *      required: true
 *      description: The skill to add.
 *      schema:
 *        "$ref": "#/definitions/skill"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating skill in profile has been added successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addSkill/:id", auth, async (req, res) => {
  const { skill } = req.body;
  const { error } = validateSkill(skill);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },
      {
        $push: {
          skills: skill,
        },
      },

      { new: true }
    );
    console.log(profile);
    res.json({ message: "Skill has been saved successfully" });
  }
});

// pulling project object
/**
 * @swagger
 *  /api/profile/deleteProject/{id}:
 *  delete:
 *    description: deleting a project
 *    summary:  deleting a project
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee to delete project
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: project
 *      description: project id
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        properties:
 *          _id:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating project has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteProject/:id", auth, async (req, res) => {
  const { _id } = req.body;
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        projects: {
          _id: _id,
        },
      },
    },

    { new: true }
  );
  res.json({ message: "Project has been pulled out successfully" });
});

// pulling experience object
/**
 * @swagger
 *  /api/profile/deleteExperince/{id}:
 *  delete:
 *    description: deleting an experience
 *    summary:  deleting a experience
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee to delete experience
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: experience
 *      description: experience id
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        properties:
 *          _id:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating experience has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteExperince/:id", auth, async (req, res) => {
  const { _id } = req.body;
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        experiences: {
          _id: _id,
        },
      },
    },

    { new: true }
  );
  res.json({ message: "Experience has been pulled out successfully" });
});

// pulling education object
/**
 * @swagger
 *  /api/profile/deleteEducation/{id}:
 *  delete:
 *    description: deleting an education
 *    summary:  deleting a education
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee to delete education
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: education
 *      description: education id
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        properties:
 *          _id:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating education has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.delete("/deleteEducation/:id", auth, async (req, res) => {
  const { _id } = req.body;
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        educations: {
          _id: _id,
        },
      },
    },
    { new: true }
  );
  res.json({ message: "Education has been pulled out successfully" });
});

/**
 * @swagger
 *  /api/profile/deleteSkill/{id}:
 *  delete:
 *    description: deleting an skill
 *    summary:  deleting a skill
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee to delete skill
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: skill
 *      description: skill id
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        properties:
 *          _id:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating skill has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteSkill/:id", auth, async (req, res) => {
  const { _id } = req.body;
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        skills: { _id: _id },
      },
    },
    { new: true }
  );

  res.json({ message: "Skill has been pulled out successfully" });
});

/**
 * @swagger
 *  /api/profile/deleteLanguage/{id}:
 *  delete:
 *    description: deleting an language
 *    summary:  deleting a language
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee to delete language
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: language
 *      description: language id
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        properties:
 *          _id:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating language has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.delete("/deleteLanguage/:id", auth, async (req, res) => {
  const { _id } = req.body;
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        languages: {
          _id: _id,
        },
      },
    },
    { new: true }
  );
  res.json({ message: "Language has been pulled out successfully" });
});

// updating project object
/**
 * @swagger
 *  /api/profile/updateProject/{id}:
 *  put:
 *    description: Use to set the project addition
 *    summary:  Use to update the project
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: projectUpdate
 *      required: true
 *      description: The project to update.
 *      schema:
 *        "$ref": "#/definitions/projectUpdate"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating profile has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.put("/updateProject/:id", auth, async (req, res) => {
  const { project } = req.body;
  const { error } = validateProject(project);
  if (error) return res.status(400).send(error.details[0].message);
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "projects._id": project._id },
    {
      $set: {
        "projects.$.name": project.name,
        "projects.$.url": project.url,
        "projects.$.description": project.description,
      },
    },
    { new: true }
  );

  res.json({ message: "Profile has been saved successfully" });
});

// updating experience object
/**
 * @swagger
 *  /api/profile/updateExperince/{id}:
 *  put:
 *    description: Use to set the experience updation
 *    summary:  Use to update the experience
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: experienceUpdate
 *      required: true
 *      description: The experience to update.
 *      schema:
 *        "$ref": "#/definitions/experienceUpdate"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating experience has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateExperince/:id", auth, async (req, res) => {
  const { experience } = req.body;
  const { error } = validateExperience(experience);
  if (error) return res.status(400).send(error.details[0].message);
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "experiences._id": experience._id },

    {
      $set: {
        "experiences.$.jobTitle": experience.jobTitle,
        "experiences.$.company": experience.company,
        "experiences.$.industry": experience.industry,
        "experiences.$.localtion": experience.localtion,
        "experiences.$.startDate": experience.startDate,
        "experiences.$.endDate": experience.endDate,
        "experiences.$.description": experience.description,
      },
    },

    { new: true }
  );
  res.json({ message: "Experience has been updated and saved successfully" });
});

// updating education object
/**
 * @swagger
 *  /api/profile/updateEducation/{id}:
 *  put:
 *    description: Use to set the education updation
 *    summary:  Use to update the education
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: educationUpdate
 *      required: true
 *      description: The education to update.
 *      schema:
 *        "$ref": "#/definitions/educationUpdate"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating education has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateEducation/:id", auth, async (req, res) => {
  const { education } = req.body;
  const { error } = validateEducation(education);
  if (error) return res.status(400).send(error.details[0].message);
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "educations._id": education._id },
    {
      $set: {
        "educations.$.instituteName": education.instituteName,
        "educations.$.programme": education.programme,
        "educations.$.major": education.major,
        "educations.$.completionYear": education.completionYear,
      },
    },

    { new: true }
  );

  res.json({
    message: "Education has been updated and saved successfully",
  });
});

// updating skill object
/**
 * @swagger
 *  /api/profile/updateSkill/{id}:
 *  put:
 *    description: Use to set the skill updation
 *    summary:  Use to update the skill
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: skillUpdate
 *      required: true
 *      description: The skill to update.
 *      schema:
 *        "$ref": "#/definitions/skillUpdate"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating skill has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateSkill/:id", auth, async (req, res) => {
  const { skill } = req.body;
  const { error } = validateSkill(skill);
  if (error) return res.status(400).send(error.details[0].message);
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "skills._id": skill._id },
    {
      $set: {
        "skills.$.name": skill.name,
        "skills.$.level": skill.level,
      },
    },
    { new: true }
  );
  console.log(profile);
  res.json({
    message: "Skill has been updated and saved successfully",
  });
});

// updating laguage object
/**
 * @swagger
 *  /api/profile/updateLanguage/{id}:
 *  put:
 *    description: Use to set the language updation
 *    summary:  Use to update the language
 *    tags: [Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the of employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: body
 *      name: languageUpdate
 *      required: true
 *      description: The skill to update.
 *      schema:
 *        "$ref": "#/definitions/languageUpdate"
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating language has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateLanguage/:id", auth, async (req, res) => {
  const { language } = req.body;
  const { error } = validateLanguage(language);
  if (error) return res.status(400).send(error.details[0].message);
  await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "languages._id": language._id },
    {
      $set: {
        "languages.$.name": language.name,
        "languages.$.level": language.level,
      },
    },
    { new: true }
  );
  console.log(profile);
  res.json({
    message: "Language has been updated and saved successfully",
  });
});

module.exports = router;
