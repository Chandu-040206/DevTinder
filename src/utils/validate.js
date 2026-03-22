const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name not valid");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Email not valid");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong");
    }
};

const validateProfileEditData = (req) => {
    const allowedKeys = ["firstName", "lastName", "age", "gender","skills","photoUrl","about"];
    const isEditAllowed = Object.keys(req.body).every(field => allowedKeys.includes(field));
    return isEditAllowed;
}

const validateForgotPassword = (req) => {
    const { password } = req.body;
    if (!password) {
        throw new Error("Password is required");
    }
    const allowedKeys = ["password"];
    const validatePassword = Object.keys(req.body).every(field => allowedKeys.includes(field));
    if (!validatePassword) {
        throw new Error("Given Fields are not valid")
    }
    const isPasswordStrong = validator.isStrongPassword(password);
    return isPasswordStrong;
}

module.exports = {
    validateSignUpData, validateProfileEditData , validateForgotPassword
}