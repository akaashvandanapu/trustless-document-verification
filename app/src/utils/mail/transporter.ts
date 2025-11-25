import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "akaashgupta2005@gmail.com",
    pass: process.env.MAIL_PASS || "",
  },
});
export default transporter;
