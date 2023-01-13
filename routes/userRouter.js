const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    res
      .status(200)
      .send({ message: "User Created Successfull", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error Creating User", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login Successfull", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error When Login", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      res.status(200).send({
        message: "User does not exist",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: { ...user._doc, password: "" },
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error getting user info",
      success: false,
      error,
    });
  }
});

router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
  try {
    const newDoctor = new Doctor({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });

    const unseenNotification = adminUser.unseenNotification;
    unseenNotification.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newDoctor.id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onClickPath: "/admin/doctors",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotification });
    res.status(200).send({
      success: true,
      message: "Doctor account applied successfully...",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({
        message: "Error Applying Doctor Account",
        success: false,
        error,
      });
  }
});

router.post(
  "/mark-all-notifications-as-seen",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotification = user.unseenNotification;
      const seenNotifications=user.seenNotifications;
      seenNotifications.push(...unseenNotification);
      user.unseenNotification=[];
      user.seenNotifications=seenNotifications;
      const updatedUser=await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({
          message: "Error Applying Doctor Account",
          success: false,
          error,
        });
    }
  }
);

router.post(
  "/delete-all-notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      user.seenNotifications=[];
      user.unseenNotification=[];
      const updatedUser=await user.save();
      updatedUser.password=undefined;
      res.status(200).send({
        success: true,
        message: "All notifications deleted",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({
          message: "Error Applying Doctor Account",
          success: false,
          error,
        });
    }
  }
);
module.exports = router;
