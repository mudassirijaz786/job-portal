const express = require("express");
const { ContactUs, validate } = require("../models/contactUsMessages");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ContactUs
 *   description: ContactUs management
 */
/**
 * @swagger
 * /api/contact:
 *  get:
 *    description: Use to request all contacts
 *    summary:  Use to request all contacts
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg iscontact field in JWT.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg all contacts in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/", auth, async (req, res) => {
  try {
    const result = await ContactUs.find();
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// getting undreadMessages by id
/**
 * @swagger
 * /api/contact/unreadMessages:
 *  get:
 *    description: get the unread messages
 *    summary:  use to request get the unread messages
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg a contact us message(Unread) in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/unreadMessages", auth, async (req, res) => {
  try {
    const messages = await ContactUs.find({ read: false });
    res.json({ messages: messages });
    if (!messages) {
      res.status(400).json({ message: "not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/me/{id}:
 *  get:
 *    description: Use to request a single contact
 *    summary:  Use to request a single contact
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg iscontact field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the contact to get.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg all contacts in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  try {
    const result = await ContactUs.findById({ _id: req.params.id });
    if (!result) res.status(404).json({ error: "Not Found" });
    else {
      res.json({ data: result });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/:
 *  post:
 *    description: use to post the new contact us message
 *    summary: use to post the new contact us message.
 *    tags: [ContactUs]
 *    parameters:
 *    - in: body
 *      name: message
 *      description: The message to save.
 *      schema:
 *        type: object
 *        required:
 *        - firstName
 *        - firstName
 *        - phoneNumber
 *        - email
 *        - message
 *        properties:
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          phoneNumber:
 *            type: string
 *          email:
 *            type: string
 *          message:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: success mesage in json formet indicating message has been forwarded...
 *      '400':
 *        description: message in json format indicating contact with email already exists.
 */
router.post("/", async (req, res) => {
  try {
    const details = _.pick(req.body, [
      "firstName",
      "lastName",
      "message",
      "phoneNumber",
      "email",
    ]);
    const message = new ContactUs(details);
    const result = await message.save();
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/delete/{id}:
 *  delete:
 *    description: Use to delete the message
 *    summary:  Use to delete the message
 *    tags: [ContactUs]
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
 *      description:  Object ID of the messgae to delete
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating  Message Deleted successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/delete/:id", admin, async (req, res) => {
  try {
    await ContactUs.findByIdAndRemove(req.params.id);
    res.json({ message: "Message Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/read/{id}:
 *  put:
 *    description: Use to set the message status to read.
 *    summary:  Use to set the message status to read.
 *    tags: [ContactUs]
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
 *      description:  Object ID of the messgae to set read
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating Message status set to read successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/read/:id", admin, async (req, res) => {
  try {
    await ContactUs.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          read: true,
        },
      },
      { new: true }
    );
    res.json({ message: "Message status set to read successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
