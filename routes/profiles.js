const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { Profile } = require("../models/profile");
// const auth = require("../middleware/auth");

const router = express.Router();

// profile creation route
router.post("", auth, auth, async (req, res) => {
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
  res.json({ message: "Profile has been saved successfully" });
});
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
  res.json({ message: "Profile has been saved successfully" });
});

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
  res.json({ message: "Profile has been saved successfully" });
});

// router.post("/addExperince/:id",auth, async (req, res) => {
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
  res.json({ message: "Profile has been saved successfully" });
});
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
  res.json({ message: "Profile has been saved successfully" });
});

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
});
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
});
router.put("/deleteEducation/:id", auth, async (req, res) => {
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
// TODO: testing on postman
router.put("/deleteSkill/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        skills: {
          name: req.body.skill.name,
          level: req.body.skill.level,
        },
      },
    },
    { new: true }
  );
});
// TODO: testing on postman
router.put("/deleteLanguage/:id", auth, async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id },
    {
      $pull: {
        languages: {
          name: req.body.language.name,
          lavel: req.body.language.level,
        },
      },
    },
    { new: true }
  );
});

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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});
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
  console.log(profile);
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});

router.post("/updateEducation/:id", auth, async (req, res) => {
  const { education } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { employee_id: req.params.id, "education._id": education._id },
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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});
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

  res.json({ message: "Profile has been saved successfully" });
});

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
  //   {$set: {"items.$.name": "yourValue","items.$.value": "yourvalue"}})
  res.json({ message: "Profile has been saved successfully" });
});

module.exports = router;
