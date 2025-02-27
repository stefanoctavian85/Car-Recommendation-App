import models from "../models/index.js";
import { jwtDecode } from 'jwt-decode';

export default async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const email = jwtDecode(token).email;

        const user = await models.User.findOne({
            email: email,
        });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}