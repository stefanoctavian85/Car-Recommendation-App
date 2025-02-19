import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    firstname: String,
    lastname: String,
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["regular", "admin"],
        default: "regular",
    }
}, { collection: 'Users'});

export default mongoose.model("User", userSchema);