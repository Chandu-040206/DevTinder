const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validate");
const { validateForgotPassword } = require("../utils/validate");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("Something went wrong :" + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateProfileEditData(req)) {
            throw new Error("Some of the fields can't be edited")
        }
        const loggedUser = req.user;
        Object.keys(req.body).forEach((key) => (loggedUser[key] = req.body[key]));
        await loggedUser.save();
        res.json({
            message: "Profile edited successfully",
            data: loggedUser
        });
    }
    catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        if (!validateForgotPassword(req)) {
            throw new Error("Enter strong password")
        }
        const loggedUser = req.user;
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        loggedUser.password = hashPassword;
        await loggedUser.save();
        res.send("Password saved successfully");
    }
    catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

module.exports = profileRouter;