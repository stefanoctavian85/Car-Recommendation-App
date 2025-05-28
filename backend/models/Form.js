import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    responses: [{
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true
        }
    }],
    predictions: [{
        type: String,
        required: true,
    }],
    cluster: {
        type: String,
        required: true,
    }
}, { timestamps: true, collection: 'Forms' });

export default mongoose.model("Form", formSchema);