const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Please login !!");
        }
        const decodedObj = jwt.verify(token, "Chandu@123");
        const { _id } = decodedObj;
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found")
        }
        req.user = user;
        next();
    }
    catch (err) {
         res.status(400).send("Something went wrong : "+err.message);
    }
}
module.exports = {userAuth};