import models from "../../models/index.js";

const userInformations = async (req, res, next) => {
    try {
        const { uid } = req.params;

        const user = await models.User.findOne({
            _id: uid,
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        return res.status(200).json({
            user
        });
    } catch (err) {
        next(err);
    }
}

export default {
    userInformations,
}