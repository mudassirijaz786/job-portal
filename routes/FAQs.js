const auth = require("../middleware/auth");
const _ = require("lodash");
const { FAQs, validate } = require("../models/faqs");
const express = require("express");
const router = express.Router();

// getiing all faqs
router.get("/", async (req, res) => {
  const faqs = await FAQs.find();
  if (!faqs) {
    res.status(400).json({ notFound: "no faq in database" });
  } else {
    res.json({ data: faqs });
  }
});

// getting a faq by id
router.get("/:id", async (req, res) => {
  const faq = await FAQs.findById(req.params.id);
  if (faq) {
    res.json({ data: faq });
  } else {
    res.status(400).json({ error: "faq not found" });
  }
});

// posting a faq
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const faqs = new FAQs(_.pick(req.body, ["question", "answer"]));
  await faqs.save();
  res.json({ message: "faqs has been saved successfully", data: faqs });
});

// FIXME: updation not working
// updating a faq
router.put("/:id", async (req, res) => {
  const faq = req.body.faq;
  const faqs = await FAQs.findByIdAndUpdate(
    req.params.id,
    { $set: { faq } },
    { new: true }
  );
  res.json({ message: "faqs has been updated and successfully", data: faqs });
});

// deleting a faq
router.delete("/:id", async (req, res) => {
  const faq = await FAQs.findByIdAndRemove(req.params.id);
  console.log(faq);
  if (!faq) {
    res.status(404).json({ notFound: "No faq found" });
  } else {
    res.json({ message: "faqs has been deleted successfully" });
  }
});

module.exports = router;
