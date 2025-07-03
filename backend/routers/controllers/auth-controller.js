import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import models from "../../models/index.js";

const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required!",
        });
    }

    try {
        let user = await models.User.findOne({
            email: email
        });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({
                    id: user._id, email: user.email,
                }, process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });

                const userObj = user.toObject();
                delete userObj.password;
                res.status(200).json({
                    token,
                    user: userObj
                });
            } else {
                res.status(404).json({
                    message: "Invalid email or password!",
                })
            }
        } else {
            res.status(404).json({
                message: "Invalid email or password!",
            })
        }
    } catch (err) {
        next(err);
    }
}

const register = async (req, res, next) => {
    const { email, firstname, lastname, password } = req.body;

    if (!email || !password || !firstname || !lastname) {
        return res.status(400).json({
            message: "Email, first name, last name and password are required!",
        });
    }

    try {
        const userExists = await models.User.findOne({ email: email });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash(password, 10);
            let user = await models.User.create({ email: email, firstname: firstname, lastname: lastname, password: hashedPassword, status: "regular", statusAccountVerified: 'uninitialized' });
            await user.save();

            const token = jwt.sign({
                id: user._id, email: user.email,
            }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            const userObj = user.toObject();
            delete userObj.password;
            res.status(200).json({
                token,
                user: userObj
            });
        } else {
            res.status(400).json({
                message: "A user with this email already exists!",
            });
        }
    } catch (err) {
        next(err);
    }
}

export default {
    login,
    register
}