const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { CompanyProfile, validate } = require("../models/companyProfile");

const router = express.Router();

// company profile
router.get("/me/:id", auth, async (req, res) => {
  const profile = await CompanyProfile.findOne({ company_id: req.params.id });
  if (profile) {
    res.json({ data: profile });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }
});

// company profile creation
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = new CompanyProfile(
    _.pick(req.body, [
      "company_id",
      "ceo",
      "address",
      "city",
      "description",
      "url",
      "noOfEmployees",
    ])
  );

  await profile.save();
  res.json({
    message: "Company Profile has been saved successfully",
    data: profile,
  });
});

router.delete("/deleteProfile/:id", auth, async (req, res) => {
  const profile = await CompanyProfile.findByIdAndRemove(req.params.id);
  res.json({ message: "Language has been pulled out successfully" });
});

router.put("/:id", auth, async (req, res) => {
  const profile = await CompanyProfile.findOneAndUpdate(
    { company_id: req.params.id },
    {
      $set: {
        ceo: req.body.ceo,
        address: req.body.address,
        city: req.body.city,
        description: req.body.description,
        url: req.body.url,
        noOfEmployees: req.body.noOfEmployees,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});

module.exports = router;
