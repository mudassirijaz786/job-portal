const auth = require("../middleware/auth");
const _ = require("lodash");
const { FAQs } = require("../models/faqs");
const router = express.Router();

router.get("/", async (req, res) => {
  const faqs = await FAQs.find();
  res.send(faqs);
});
router.get("/:id", async (req, res) => {
  const faq = await FAQs.findById(req.params.id);
  res.send(faq);
});
router.post("/", async (req, res) => {
  const faqs = new FAQs(_.pick(req.body, ["question", "answer"]));
  await faqs.save();
  res.json({ message: "faqs has been saved successfully" });
});

router.put("/:id", async (req, res) => {
  const faq = req.body.faq;
  const faq = await FAQs.findByIdAndUpdate(
    req.params.id,
    { $set: { faq } },
    { new: true }
  );
  res.json({ message: "faqs has been updated and successfully" });
});

router.delete("/:id", async (req, res) => {
  const faq = await FAQs.findByIdAndRemove(req.params.id);
  res.json({ message: "faqs has been deleted successfully" });
});
