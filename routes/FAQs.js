const admin = require("../middleware/admin");
const _ = require("lodash");
const { FAQs, validate } = require("../models/faqs");
const express = require("express");
const router = express.Router();

// getiing all faqs
/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: FAQ management
 */
/**
 * @swagger
 * /api/faq:
 *  get:
 *    description: Use to request all faqs
 *    summary:  Use to request all faqs
 *    tags: [FAQ]
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg all faqs in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 */
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQs.find();
    if (!faqs) {
      res.status(404).json({ notFound: "no faq in database" });
    } else {
      res.json({ data: faqs });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// getting a faq by id
/**
 * @swagger
 * /api/faq/{id}:
 *  get:
 *    description+: Use to request the data about a faq
 *    summary: Gets a faq by ID.
 *    tags: [FAQ]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the faq to get it.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg the info about that particular faq
 *      '404':
 *        description: message in json format indicating faq not found!
 */
router.get("/:id", async (req, res) => {
  try {
    const faq = await FAQs.findById(req.params.id);
    if (faq) {
      res.json({ data: faq });
    } else {
      res.status(404).json({ notFound: "faq not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// posting a faq
/**
 * @swagger
 * /api/faq/:
 *  post:
 *    description: use to post a faq
 *    summary: use to post a faq into system
 *    tags: [FAQ]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg isAdmin field in JWT.
 *    - in: body
 *      name: faq
 *      description: The faq to add.
 *      schema:
 *        type: object
 *        required:
 *        - question
 *        - answer
 *        properties:
 *          question:
 *            type: string
 *          answer:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: a successful message saying faq has been posted
 *      '400':
 *        description: message contains error indications
 */

router.post("/", admin, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const faqs = new FAQs(_.pick(req.body, ["question", "answer"]));
    await faqs.save();
    res.json({ message: "faqs has been saved successfully", data: faqs });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//updating a faq
/**
 * @swagger
 *  /api/faq/{id}:
 *  put:
 *    description: Use to set the faq updated
 *    summary:  Use to update the faq
 *    tags: [FAQ]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description:  Object ID of faq ti update
 *    - in: body
 *      name: faq
 *      required: true
 *      description: The faq to update.
 *      schema:
 *        "$ref": "#/definitions/faq"
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating faq has been updated successfully
 *      '404':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/:id", admin, async (req, res) => {
  try {
    let found = await FAQs.findById({ _id: req.params.id });
    if (!found) {
      return res.status(404).json({
        error: "No faq in the system",
      });
    } else {
      const faqs = await FAQs.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.json({
        message: "faqs has been updated and successfully",
        data: faqs,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// deleting a faq
/**
 * @swagger
 * /api/faq/{id}:
 *  delete:
 *    description: Use to delete the faq
 *    summary:  Use to delete the faq
 *    tags: [FAQ]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description:  Object ID of the faq to delete
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating  faq Deleted successfully
 *      '404':
 *        description: A successful response message in json indicating  faq Deleted successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/:id", admin, async (req, res) => {
  try {
    const faq = await FAQs.findByIdAndRemove(req.params.id);
    if (!faq) {
      res.status(404).json({ notFound: "No faq found" });
    } else {
      res.json({ message: "faqs has been deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
