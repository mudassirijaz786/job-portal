const auth = require("../middleware/auth");
const _ = require("lodash");
const { TAC, validate } = require("../models/termsAndConditions");
const express = require("express");
const router = express.Router();

// getting all tac
router.get("/", auth, async (req, res) => {
  const tac = await TAC.find();
  res.json({ data: tac });
});

// getting tac by id
router.get("/:id", auth, async (req, res) => {
  const tac = await TAC.findById(req.params.id);
  if (!tac) {
    res.status(400).json({ notFound: "not found in system" });
  } else {
    res.json({ data: tac });
  }
});

// posting a tac
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const tac = new TAC(_.pick(req.body, ["description"]));
  await tac.save();
  res.json({
    message: "termsAndCondition has been saved successfully",
    data: tac,
  });
});

// FIXME: updation not working
// updation in tac
router.put("/:id", auth, async (req, res) => {
  const description = req.body.description;
  const tac = await TAC.findByIdAndUpdate(
    req.params.id,
    { $set: description },
    { new: true }
  );
  res.json({
    message: "termsAndCondition has been updated and successfully",
    data: tac,
  });
});

// deleting a tac
router.delete("/:id", auth, async (req, res) => {
  const tac = await TAC.findByIdAndRemove(req.params.id);
  if (!tac) {
    res.status(400).json({ notFound: "termsAndCondition not found" });
  } else {
    res.json({ message: "termsAndCondition has been deleted successfully" });
  }
});
module.exports = router;
