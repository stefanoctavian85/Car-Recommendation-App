import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["regular", "admin"],
        default: "regular",
    },
    phoneNumber: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    idCardExpirationDate: {
        type: Date,
    },
    driverLicenseExpirationDate: {
        type: Date,
    },
    statusAccountVerified: {
        type: String,
        enum: ['uninitialized', 'rejected', 'pending', 'approved'],
        default: 'uninitialized',
        required: true,
    },
    cluster: {
        type: Number,
    },
    hasCompletedRecommendation: {
        type: Boolean,
    }
}, { collection: 'Users'});

export default mongoose.model("User", userSchema);