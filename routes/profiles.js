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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg a current profile of employee
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ employee_id: req.params.id });
    if (profile) {
      res.json({ data: profile });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
    res.json({ data: profile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating profile has been created successfully
 *      '400':
 *        description: error for bad request
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/", auth, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/profile/summary/{id}:
 *  post:
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg summary updation
 *      '404':
 *        description: message in json format indicating  not found!
 *      '400':
 *        description: error for bad request
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/summary/:id", auth, async (req, res) => {
  try {
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating profile has been created successfully
 *      '400':
 *        description: error for bad request
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addProject/:id", auth, async (req, res) => {
  try {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id },
        {
          $push: {
            projects: req.body,
          },
        },
        { new: true }
      );
      res.json({ message: "Project has been saved successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating experience in profile has been added successfully
 *      '400':
 *        description: error for bad request
 *      '404':
 *        description: response message that profile not found
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addExperince/:id", auth, async (req, res) => {
  try {
    const { error } = validateExperience(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id },
        {
          $push: {
            experiences: req.body,
          },
        },
        { new: true }
      );
      res.json({
        message: "Experience has been saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating addEducation in profile has been added successfully
 *      '404':
 *        description: A successful response message that profile not found
 *      '400':
 *        description: response for bad request
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addEducation/:id", auth, async (req, res) => {
  try {
    const { error } = validateEducation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id },
        {
          $push: {
            educations: req.body,
          },
        },
        { new: true }
      );
      res.json({
        message: "Education has been saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating language in profile has been added successfully
 *      '404':
 *        description: not found
 *      '400':
 *        description: bad request
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addLanguage/:id", auth, async (req, res) => {
  try {
    const { error } = validateLanguage(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id },
        {
          $push: {
            languages: req.body,
          },
        },
        { new: true }
      );
      res.json({
        message: "Language has been saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating skill in profile has been added successfully
 *      '404':
 *        description: A successful response message that profile not found
 *      '400':
 *        description: bad request
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.post("/addSkill/:id", auth, async (req, res) => {
  try {
    const { error } = validateSkill(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id },
        {
          $push: {
            skills: req.body,
          },
        },
        { new: true }
      );
      res.json({ message: "Skill has been saved successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating project has been deleted
 *      '404':
 *        description: A successful response message that profile not found
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteProject/:id", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '404':
 *        description: A successful response message that profile not found
 *      '200':
 *        description: A successful response message in json indicating experience has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteExperince/:id", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '404':
 *        description: A successful response message that profile not found
 *      '200':
 *        description: A successful response message in json indicating education has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.delete("/deleteEducation/:id", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '404':
 *        description: A successful response message that profile not found
 *      '200':
 *        description: A successful response message in json indicating skill has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteSkill/:id", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '404':
 *        description: A successful response message that profile not found
 *      '200':
 *        description: A successful response message in json indicating language has been deleted
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.delete("/deleteLanguage/:id", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating profile has been uppdated successfully
 *      '400':
 *        description: bad request
 *      '404':
 *        description: not found
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.put("/updateProject/:id", auth, async (req, res) => {
  try {
    const { _id, name, url, description } = req.body;
    const { error } = validateProject(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      console.log(req.body);
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id, "projects._id": _id },
        {
          $set: {
            "projects.$.name": name,
            "projects.$.url": url,
            "projects.$.description": description,
          },
        },
        { new: true }
      );
      res.json({ message: "Profile has been saved successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '400':
 *        description: bad request
 *      '404':
 *        description: not found
 *      '200':
 *        description: A successful response message in json indicating experience has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateExperince/:id", auth, async (req, res) => {
  try {
    const {
      _id,
      jobTitle,
      company,
      industry,
      localtion,
      startDate,
      endDate,
      description,
    } = req.body;
    const { error } = validateExperience(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id, "experiences._id": _id },
        {
          $set: {
            "experiences.$.jobTitle": jobTitle,
            "experiences.$.company": company,
            "experiences.$.industry": industry,
            "experiences.$.localtion": localtion,
            "experiences.$.startDate": startDate,
            "experiences.$.endDate": endDate,
            "experiences.$.description": description,
          },
        },
        { new: true }
      );
      res.json({
        message: "Experience has been updated and saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '400':
 *        description: bad request
 *      '404':
 *        description: not found
 *      '200':
 *        description: A successful response message in json indicating education has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateEducation/:id", auth, async (req, res) => {
  try {
    const { _id, instituteName, programme, major, completionYear } = req.body;
    const { error } = validateEducation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id, "educations._id": _id },
        {
          $set: {
            "educations.$.instituteName": instituteName,
            "educations.$.programme": programme,
            "educations.$.major": major,
            "educations.$.completionYear": completionYear,
          },
        },
        { new: true }
      );
      res.json({
        message: "Education has been updated and saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '400':
 *        description: bad request
 *      '404':
 *        description: not found
 *      '200':
 *        description: A successful response message in json indicating skill has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateSkill/:id", auth, async (req, res) => {
  try {
    const { _id, name, level } = req.body;
    const { error } = validateSkill(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id, "skills._id": _id },
        {
          $set: {
            "skills.$.name": name,
            "skills.$.level": level,
          },
        },
        { new: true }
      );
      res.json({
        message: "Skill has been updated and saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
 *      '500':
 *        description: internal server error
 *      '400':
 *        description: bad request
 *      '404':
 *        description: not found
 *      '200':
 *        description: A successful response message in json indicating language has been uppdated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/updateLanguage/:id", auth, async (req, res) => {
  try {
    const { _id, level, name } = req.body;
    const { error } = validateLanguage(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Profile.findOne({ employee_id: req.params.id });
    if (!found) {
      res.status(404).json({ message: "Profile Not Found!" });
    } else {
      await Profile.findOneAndUpdate(
        { employee_id: req.params.id, "languages._id": _id },
        {
          $set: {
            "languages.$.name": name,
            "languages.$.level": level,
          },
        },
        { new: true }
      );
      res.json({
        message: "Language has been updated and saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
