const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware); //middleware

router.get("/get-all-doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error Applying Doctor Account",
      success: false,
      error,
    });
  }
});

router.get("/get-all-users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error Applying Doctor Account",
      success: false,
      error,
    });
  }
});

router.post("/change-doctor-status", async (req, res) => {
  try {
    const { doctorId, status, userId } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { status });
    res.status(200).send({
      success: true,
      message: "Doctor status updated successfully",
      data: doctor,
    });
    const user = await User.findOne({ _id: userId });

    const unseenNotification = user.unseenNotification;
    unseenNotification.push({
      type: "new-doctor-request-changed",
      message: `Your Doctor Account has been ${status}`,
      onClickPath: "/notifications",
    });
    await User.findByIdAndUpdate(user._id, { unseenNotification });

    res.status(200).send({
        success: true,
        message: "Doctor status updated successfully",
        data: doctor,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error Applying Doctor Account",
      success: false,
      error,
    });
  }
});

module.exports = router;
