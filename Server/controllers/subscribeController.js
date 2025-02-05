const Subscriber = require('../models/Subscriber');
const validator = require('validator');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
require('dotenv').config();

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: ` <html>
    <body>
    <div style="text-align: center; background-color: #fdfdfd; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #f55951;">Email Verification</h2>
        <p style="font-size: 18px; margin: 20px 0;">Thank you for subscribing to KEECHU!</p>
        <p style="font-size: 16px; margin: 20px 0;">We are excited to have you on board.</p>
        <p style="font-size: 16px; margin: 20px 0;">Please click the following link to verify your email:</p>
        <a href="https://keechu.onrender.com/verify/${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #f55951; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
    </body>
  </html>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Welcome to Your App!',
    html: '<p>Thank you for joining us! Welcome to our community.</p>',
  };

  await transporter.sendMail(mailOptions);

  console.log(`Welcome email sent successfully to ${email}.`);
};

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate the email address
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Check if the email already exists in the database
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isVerified) {
        // If the email is already verified, send a success response
        return res.status(200).json({ message: 'Email address is already subscribed and verified.' });
      } else {
        // If the email is not verified, send a message to check their email for verification
        return res.status(200).json({ message: 'Kindly check your email for verification.' });
      }
    }

    // Generate a unique verification token
    const verificationToken = uuid.v4();

    // Create a new subscriber with verification status as false
    const newSubscriber = new Subscriber({ email, verificationToken, isVerified: false });
    await newSubscriber.save();

    // Send a verification email
    await sendVerificationEmail(email, verificationToken);

    // Add a console log message here
    console.log('Verification email sent for subscriber:', email);

    // Send a success response back to the client
    res.status(200).json({ message: 'Subscription successful. Verification email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.params.token;
  try {
    const subscriber = await Subscriber.findOne({ verificationToken: token });
    if (!subscriber) {
      return res.status(404).send('Invalid verification token.');
    }
    if (subscriber.isVerified) {
      return res.status(200).send('Email is already verified.');
    }

    subscriber.isVerified = true;
    await subscriber.save();

    await sendWelcomeEmail(subscriber.email);
    // Add a console log message here
    console.log('Email verification successful for subscriber:', subscriber.email);

    res.send('Email verification successful.');
    
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during email verification.');
  }
};

module.exports = {
  subscribe,
  verifyEmail,
};
