import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import validator from "validator";
import crypto from "crypto";
import axios from "axios";
const router = express.Router();
import { UserModel } from "../models/Users.js";

router.get("/verifyEmail/:emailToken", async (req, res) => {
  try {
    const emailToken = req.params.emailToken;

    if (!emailToken) return res.status(404).json("Email token not found");

    const user = await UserModel.findOne({ emailToken });

    if (user) {
      console.log("User found:", user); // Add this line
      user.isVerified = true;
      user.emailToken = null;
      await user.save();

      const token = jwt.sign({ id: user._id }, "secretemail");

      console.log("Verification successful. User details:", user); // Add this line

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
        verified: user?.verified,
      });
    } else {
      console.log("User not found for token:", emailToken); // Add this line
      res.status(404).json("Email verification failed: invalid token");
    }
  } catch (error) {
    console.log("Error during verification:", error); // Add this line
    res.status(500).json(error.message);
  }
});

router.get("/:userId", async (req, res) => {
  try {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Find the user by ID in the database
    const user = await UserModel.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user data in the response
    res.status(200).json(user);
  } catch (error) {
    // Handle errors
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const userCount = await UserModel.countDocuments();
  let isAdmin = "sec";
  if (userCount === 0) {
    isAdmin = "admin";
  }
  let isVerified = false;
  if (userCount === 0) {
    isVerified = true;
  }

  try {
    const user = await UserModel.findOne({ username });

    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailToken = crypto.randomBytes(64).toString("hex");

    const newUser = new UserModel({
      username,
      password: hashedPassword,
      isAdmin,
      email,
      isVerified,
      emailToken,
    });

    const userdata = await newUser.save();
    console.log(userdata);
    if (userdata) {
      sendVerifyMail(username, email, userdata._id, emailToken);
    }

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Username or password is incorrect" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Username or password is incorrect" });
    }

    const token = jwt.sign({ id: user._id }, "secret");
    res.json({
      token,
      userID: user._id,
      username: username,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRouter };

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    jwt.verify(authHeader, "secret", (err) => {
      if (err) {
        return res.sendStatus(403);
      }
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// for sending mail
const sendVerifyMail = async (name, email, userID, emailToken) => {
  try {
    const verificationLink = `http://localhost:4000/auth/verifyEmail/${emailToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aggarwalujjwal66@gmail.com", // Replace with your Gmail address
        pass: "hcll amyi ywta khxe", // Replace with your Gmail password or an application-specific password
      },
    });

    const mailOptions = {
      from: "your-gmail-account@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `
        <p>Hello ${name},</p>
        <p>Please click on the following link to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
