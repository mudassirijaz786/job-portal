const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { Profile } = require("../models/profile");

const router = express.Router();

// profile creation route
router.post("", auth, async (req, res) => {
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
  //   const profile = new Profile({ profile });

  await profile.save();
  res.json({ message: "Profile has been saved successfully" });
});

router.post("/summary/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $set: {
        summary: req.body.summary,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});
router.post("/addProject/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        projects: req.body.project,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});

router.post("/addExperince/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        experiences: req.body.experience,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});

// router.post("/addExperince/:id", async (req, res) => {
//   const profile = await Profile.findOneAndUpdate(
//     { employee_id: req.params.id },

//     {
//       $push: {
//         experiences: req.body.experience,
//       },
//     },
//     { new: true }
//   );
//   res.json({ message: "Profile has been saved successfully" });
// });

router.post("/addLanguage/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },

    {
      $push: {
        languages: req.body.language,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});
router.post("/addSkill/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $push: {
        skills: req.body.skill,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});

router.put("/deleteProject/:id", async (req, res) => {
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
});
router.put("/deleteExperince/:id", async (req, res) => {
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
});
router.put("/deleteEducation/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        educations: {
          programme: req.body.projectName,
          major: req.body.major,
        },
      },
    },
    { new: true }
  );
});

router.put("/deleteSkill/:id", async (req, res) => {
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
});

router.put("/deleteLanguage/:id", async (req, res) => {
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
});

router.post("/updateProject/:id", async (req, res) => {
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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});
router.post("/updateExperince/:id", async (req, res) => {
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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});

router.post("/updateEducation/:id", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $set: {
        "educations.$.instituteName": req.body.education.instituteName,
        "educations.$.programme": req.body.education.programme,
        "educations.$.major": req.body.education.major,
        "educations.$.completionYear": req.body.education.completionYear,
      },
    },
    { new: true }
  );
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});
router.post("/updateSkill/:id", async (req, res) => {
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

  res.json({ message: "Profile has been saved successfully" });
});

router.post("/updateLanguage/:id", async (req, res) => {
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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});

module.exports = router;
