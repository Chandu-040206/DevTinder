const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email not valid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 90
    },
    age: {
        type: Number,
        min: 10,
        max: 80
    },
    gender: {
        type: String,
        validate(data) {
            if (!["male", "female"].includes(data)) {
                throw new Error("Invalid data for Gender")
            }
        }
    },
    skills: {
        type: [String],
        default: "Javascript"
    },
    photoUrl :{
        type : String
    },
    about : {
        type : String,
        default : "This is the default description"
    }
}, { timestamps: true });

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: this._id }, "Chandu@123");
    return token;
};

userSchema.methods.validatePassword = async function(password){
    const user = this;
    const hashPassword = this.password;
     const isPasswordValid = await bcrypt.compare(password, hashPassword);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);