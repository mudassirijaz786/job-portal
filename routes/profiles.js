const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { Profile, validateSkill } = require("../models/profile");

const router = express.Router();

// my profile
router.get("/me/:id", auth, async (req, res) => {
  const profile = await Profile.findOne({ employee_id: req.params.id });
  res.send(profile);
});

// profile creation
router.post("/", auth, async (req, res) => {
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
  res.json({ message: "Profile has been saved successfully" });
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
});

// adding experience to experiences array
router.post("/addExperince/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        experiences: req.body.experience,
      },
    },
    { new: true }
  );

  res.json({ message: "Experience has been saved successfully" });
});

// adding education to educations array
router.post("/addEducation/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        educations: req.body.education,
      },
    },

    { new: true }
  );

  res.json({ message: "Education has been saved successfully" });
});

// adding language to languages array
router.post("/addLanguage/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        languages: req.body.language,
      },
    },

    { new: true }
  );

  res.json({ message: "Language has been saved successfully" });
});

// adding skill to skills array
// :FIXME: adding all messages,,,
router.post("/addSkill/:id", auth, async (req, res) => {
  const { error } = validateSkill(req.body.skill);
  if (error) {
    console.log(error.details);
    return res.status(400).json({ message: error.details[0].message });
  } else {
    const profile = await Profile.findOneAndUpdate(
      { employee_id: req.params.id },
      {
        $push: {
          skills: req.body.skill,
        },
      },

      { new: true }
    );

    res.json({ message: "Skill has been saved successfully" });
  }
});

// pulling project object
router.put("/deleteProject/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        projects: {
          _id: req.body.project._id,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Project has been pulled out successfully" });
});

// pulling experience object
router.put("/deleteExperince/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        experiences: {
          _id: req.body.experience._id,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Experience has been pulled out successfully" });
});

// pulling education object
router.put("/deleteEducation/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        educations: {
          _id: req.body.education._id,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Education has been pulled out successfully" });
});

// TODO: testing on postman
router.put("/deleteSkill/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        skills: { _id: req.body.skill._id },
      },
    },

    { new: true }
  );

  res.json({ message: "Skill has been pulled out successfully" });
});

// TODO: testing on postman
router.put("/deleteLanguage/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        languages: {
          _id: req.body.language._id,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Language has been pulled out successfully" });
});

// updating project object
router.post("/updateProject/:id", auth, async (req, res) => {
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
router.post("/updateExperince/:id", auth, async (req, res) => {
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
router.post("/updateEducation/:id", auth, async (req, res) => {
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
router.post("/updateSkill/:id", auth, async (req, res) => {
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

  res.json({
    message: "Skill has been updated and saved successfully",
  });
});

// updating laguage object
router.post("/updateLanguage/:id", auth, async (req, res) => {
  const { language } = req.body;
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

  res.json({
    message: "Language has been updated and saved successfully",
  });
});

module.exports = router;
