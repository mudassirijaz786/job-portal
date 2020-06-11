const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { Profile } = require("../models/profile");
// const auth = require("../middleware/auth");

const router = express.Router();

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

// summary update
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
router.post("/addSkill/:id", auth, async (req, res) => {
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
});

// pulling project object
router.put("/deleteProject/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        projects: {
          projectName: req.body.projectName,
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
          jobTitle: req.body.jobTitle,
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
          // programme: req.body.projectName,
          major: req.body.major,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Education has been pulled out successfully" });
});

// pulling skill object
router.put("/deleteSkill/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        skills: {
          name: req.body.name,
          level: req.body.level,
        },
      },
    },

    { new: true }
  );

  res.json({ message: "Skill has been pulled out successfully" });
});

// pulling language object
router.put("/deleteLanguage/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $pull: {
        languages: {
          name: name,
          lavel: req.body.level,
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
    { employee_id: req.params.id },

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
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        "experience.$.jobTitle": req.body.experience.jobTitle,
        "experience.$.company": req.body.experience.company,
        "experience.$.industry": req.body.experience.industry,
        "experience.$.localtion": req.body.experience.localtion,
        "experience.$.startDate": req.body.experience.startDate,
        "experience.$.endDate": req.body.experience.endDate,
        "experience.$.description": req.body.experience.description,
      },
    },

    { new: true }
  );

  res.json({
    message: "Experience has been updated and saved successfully",
  });
});

// updating education object
router.post("/updateEducation/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        "education.$.instituteName": req.body.education.instituteName,
        "education.$.programme": req.body.education.programme,
        "education.$.major": req.body.education.major,
        "education.$.completionYear": req.body.education.completionYear,
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
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        "skills.$.name": req.body.skill.name,
        "skills.$.level": req.body.skill.level,
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
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        "languages.$.name": req.body.language.name,
        "languages.$.level": req.body.language.level,
      },
    },

    { new: true }
  );

  res.json({
    message: "Language has been updated and saved successfully",
  });
});

module.exports = router;
