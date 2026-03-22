const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName age gender about photoUrl skills");

        res.json({ message: "Data fetched Successfully" , data: connectionRequests} );
    }
    catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        })
            .populate("fromUserId", "firstName lastName age gender about photoUrl skills")
            .populate("toUserId", "firstName lastName age gender about photoUrl skills");

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({
            message: "Connections fetched successfully",
            data : data
        });

    } catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id },
                { fromUserId: loggedInUser._id }
            ],
            status: { $in: ["interested", "accepted","ignored"] }
        }).select("fromUserId toUserId");

        const hideUsers = new Set();

        connectionRequests.forEach((request) => {
            hideUsers.add(request.fromUserId.toString());
            hideUsers.add(request.toUserId.toString());
        });

        const users = await User.find({
            _id: {
                $nin: Array.from(hideUsers),
                $ne: loggedInUser._id
            }
        })
        .select("firstName lastName age gender skills photoUrl about")
        .skip(skip)
        .limit(limit);

        res.status(200).json(users);

    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

module.exports = userRouter;