const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0

async function sendSimpleMessage(formData) {
  const {firstName, lastName, email, message} = formData;
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("sandboxb73d55e305ce464ca8eec5498fd0b78c.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxb73d55e305ce464ca8eec5498fd0b78c.mailgun.org>",
      to: [`${firstName} ${lastName} <${email}>`],
      subject: `Hello ${firstName + lastName}`,
      html: `Visitor's full name: ${firstName} ${lastName} <br>
             Visitor's Email Address: ${email}<br>
             Visitor's message: Congratulations on joining our community !!, remember your free box its for free :D
             `
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

module.exports = {sendSimpleMessage};