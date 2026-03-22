const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


requestRouter.post("/request/send/:status/:userId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.userId;
        const status = req.params.status;

        const allowedStatus = ["interested", "ignored"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type" })
        };

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });
        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Request already sent!!" })
        };

        const user = await User.findById(toUserId);
        if (!user) {
            return res.status(400).json({ message: "Request sending to invalid user!!" })
        };

        if (fromUserId.equals(toUserId)) {
            return res.status(400).json({ message: "Cannot send request to yourself!!" })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        });
        const data = await connectionRequest.save();
        res.json({ message: "Request sent successfully", data })
    }
    catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid review status" });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        
        if (!connectionRequest) {
            return res.status(400).json({ message: "Connection request cannot be reviewed" });
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.send("Connection request reviewed successfully!!!", data);
    }
    catch (err) {
        res.status(400).send("Something went wrong : " + err.message);
    }
});

module.exports = requestRouter;