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
} = require("../models/profile");

const router = express.Router();

// :TODO: validations in the update all methoods
// my profile
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

router.post("/summary/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
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
    res.json({ message: "Project has been saved successfully", data: profile });
  }
});

// adding experience to experiences array
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
router.put("/addSkill/:id", auth, async (req, res) => {
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
router.delete("/deleteProject/:id", auth, async (req, res) => {
  const { project } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        projects: {
          _id: project._id,
        },
      },
    },

    { new: true }
  );
  res.json({ message: "Project has been pulled out successfully" });
});

// pulling experience object
router.put("/deleteExperince/:id", auth, async (req, res) => {
  const { experience } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        experiences: {
          _id: experience._id,
        },
      },
    },

    { new: true }
  );
  res.json({ message: "Experience has been pulled out successfully" });
});

// pulling education object
router.delete("/deleteEducation/:id", auth, async (req, res) => {
  const { education } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        educations: {
          _id: education._id,
        },
      },
    },
    { new: true }
  );
  res.json({ message: "Education has been pulled out successfully" });
});

// TODO: testing on postman
router.delete("/deleteSkill/:id", auth, async (req, res) => {
  const { skill } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        skills: { _id: skill._id },
      },
    },
    { new: true }
  );

  res.json({ message: "Skill has been pulled out successfully" });
});

// TODO: testing on postman
router.delete("/deleteLanguage/:id", auth, async (req, res) => {
  const { language } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        languages: {
          _id: language._id,
        },
      },
    },
    { new: true }
  );
  console.log(profile);
  res.json({ message: "Language has been pulled out successfully" });
});

// updating project object
router.put("/updateProject/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "projects._id": project._id },
    {
      $set: {
        "projects.$.name": req.body.project.name,
        "projects.$.url": req.body.project.url,
        "projects.$.description": req.body.project.description,
      },
    },
    { new: true }
  );

  res.json({ message: "Profile has been saved successfully" });
});

// updating experience object
router.put("/updateExperince/:id", auth, async (req, res) => {
  const { experience } = req.body;
  const profile = await Profile.findOneAndUpdate(
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
router.put("/updateEducation/:id", auth, async (req, res) => {
  const { education } = req.body;
  const profile = await Profile.findOneAndUpdate(
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
router.put("/updateSkill/:id", auth, async (req, res) => {
  const { skill } = req.body;
  const profile = await Profile.findOneAndUpdate(
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
router.put("/updateLanguage/:id", auth, async (req, res) => {
  const { language } = req.body;
  console.log(language);
  const profile = await Profile.findOneAndUpdate(
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
