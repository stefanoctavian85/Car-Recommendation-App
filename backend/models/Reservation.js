import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    insurance: {
        thirdPartyLiability: {
            type: Boolean,
            default: false,
        },
        collisionDamageWaiver: {
            type: Boolean,
            default: false,
        },
        theftProtection: {
            type: Boolean,
            default: false,
        }
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true, collection: 'Reservations' });

export default mongoose.model("Reservation", reservationSchema);