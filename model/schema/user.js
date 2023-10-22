const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    mobile: {
        type: Number,

    },
    email: {
        type: String,
    },
    userName: {
        type: String,
    },
    password: {
        type: String,
    },
});


module.exports = mongoose.model("user", UserSchema);
