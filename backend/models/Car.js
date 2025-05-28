import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
    Masina: {
        type: String,
        required: true,
    },
    Culoare: {
        type: String,
        required: true,
    },
    "Anul productiei": {
        type: Number,
        required: true,
    },
    "Numar locuri": {
        type: Number,
        required: true,
    },
    Combustibil: {
        type: String,
        required: true,
    },
    "Cutie de viteze": {
        type: String,
        required: true,
    },
    "Tip Caroserie": {
        type: String,
        required: true,
    },
    "Capacitate cilindrica": {
        type: Number,
        required: true,
    },
    Putere: {
        type: Number,
        required: true,
    },
    "Transmisie": {
        type: String,
        required: true,
    },
    "Consum Urban": {
        type: Number,
        required: true,
    },
    "Consum Extraurban": {
        type: Number,
        required: true,
    },
    Pret: {
        type: Number,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
    Cluster: {
        type: Number,
        required: true,
    }
}, { collection: 'Cars' });

export default mongoose.model("Car", carSchema);