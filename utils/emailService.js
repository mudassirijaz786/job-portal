const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tradebabapk@gmail.com",
    pass: "Pakistan888",
  },
});

module.exports = sendEmailForResetPassword = (to, subject, text, _id) => {
  const mailOptions = {
    from: "tradebabapk@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: `<a href='${config.get(
      "frontEndURL"
    )}/?id=${_id}'>Reset Password</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: ", info.response);
      return true;
    }
  });
};
