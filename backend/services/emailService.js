// Wraps nodemailer so controllers just call sendXyzEmail(...) without
// touching SMTP details directly.
const nodemailer = require('nodemailer');
const { emailUser, emailPass } = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: emailUser, pass: emailPass },
});

async function sendVerificationEmail(toEmail, verificationLink) {
  if (!emailUser) {
    console.log(`[emailService] (skipped - no SMTP configured) Would send verification link to ${toEmail}: ${verificationLink}`);
    return;
  }
  await transporter.sendMail({
    from: `"Dayflow HRMS" <${emailUser}>`,
    to: toEmail,
    subject: 'Verify your Dayflow account',
    html: `<p>Welcome to Dayflow! Please verify your email by clicking below:</p>
           <p><a href="${verificationLink}">Verify my account</a></p>`,
  });
}

async function sendLeaveStatusEmail(toEmail, status, leaveType, startDate, endDate) {
  if (!emailUser) {
    console.log(`[emailService] (skipped - no SMTP configured) Leave ${status} for ${toEmail}`);
    return;
  }
  await transporter.sendMail({
    from: `"Dayflow HRMS" <${emailUser}>`,
    to: toEmail,
    subject: `Your leave request has been ${status}`,
    html: `<p>Your <strong>${leaveType}</strong> leave request (${startDate} to ${endDate}) has been <strong>${status}</strong>.</p>`,
  });
}

module.exports = { sendVerificationEmail, sendLeaveStatusEmail };
