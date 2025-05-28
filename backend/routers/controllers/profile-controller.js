import models from "../../models/index.js";
import tesseract from 'node-tesseract-ocr';
import sharp from 'sharp';
import path from 'path';

const userInformation = async (req, res, next) => {
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

const savePhoneNumber = async (req, res, next) => {
    try {
        const { id, phoneNumber } = req.body;

        const user = await models.User.findOne({
            _id: id,
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const phoneNumberRegex = /^\d{10}$/;
        if (!phoneNumberRegex.test(phoneNumber)) {
            return res.status(400).json({
                message: "Invalid phone number. Must be exactly 10 digits!",
            });
        }

        user.phoneNumber = phoneNumber;
        await user.save();

        return res.status(200).json({
            message: "Phone number updated successfully!",
        });
    } catch (err) {
        next(err);
    }
}

const config = {
    lang: 'ron',
    oem: 1,
    psm: 3,
}

const preprocessIDCard = async (imagePath) => {
    try {
        const objPath = path.parse(imagePath);
        const outputImagePath = `${objPath.dir}/${objPath.name}-processed${objPath.ext}`;

        await sharp(imagePath)
            .resize(3000, null, {
                fit: 'inside',
                withoutEnlargement: false,
            })
            .greyscale()
            .normalize()
            .sharpen({
                sigma: 1.5,
            })
            .modulate({
                brightness: 1.5,
                contrast: 1.4,
            })
            .median(3)
            .toFile(outputImagePath);

        return outputImagePath;
    } catch (err) {
        console.error("Error at preprocessing image: ", err);
        return imagePath;
    }
}

const preprocessDriverLicense = async (imagePath) => {
    try {
        const objPath = path.parse(imagePath);
        const outputImagePath = `${objPath.dir}/${objPath.name}-processed${objPath.ext}`;

        await sharp(imagePath)
            .resize(3000, null, {
                fit: 'inside',
                withoutEnlargement: false,
            })
            .greyscale()
            .normalize()
            .sharpen({
                sigma: 1.2,
            })
            .modulate({
                brightness: 1.2,
                contrast: 1.3,
            })
            .threshold(128)
            .toFile(outputImagePath);

        return outputImagePath;
    } catch (err) {
        console.error("Error at preprocessing image: ", err);
        return imagePath;
    }
}

const extractIDCardData = (text) => {
    const regexName = /(Last name\s*\n([A-Za-z\s-]+))/;
    const regexFirstName = /(First name\s*\n([A-Za-z\s-]+))/;
    const regexCNP = /(c\s*[A-Za-z]+\s(\d{13}))/i;
    const regexIssueDate = /(\d{2}\.\d{2}\.\d{2})/;
    const regexExpirationDate = /(\d{2}\.\d{2}\.\d{4})/;

    const matchName = text.match(regexName);
    const matchFirstName = text.match(regexFirstName);
    const matchCNP = text.match(regexCNP);
    const matchIssueDate = text.match(regexIssueDate)
    const matchExpirationDate = text.match(regexExpirationDate);

    return {
        lastname: matchName ? matchName[2].replace(/\r?\n.*/, '').trim() : 'undetected',
        firstname: matchFirstName? matchFirstName[2].replace(/\r?\n.*/, '').trim() : 'undetected',
        issueDate: matchIssueDate ? matchIssueDate[1] : 'undetected',
        expirationDate: matchExpirationDate ? matchExpirationDate[1] : 'undetected',
        CNP: matchCNP ? matchCNP[2].replace(/\r?\n.*/, '').trim() : 'undetected',
    }
}

const extractDriverLicenseData = (text) => {
    const regexName = /1\.\s*([A-Za-z\s-]+)/;
    const regexFirstName = /2\.\s*([A-Za-z\s-]+)/;
    const regexIssueDate = /4a\.\s*(\d{2}\.\d{2}\.\d{4})/;
    const regexExpirationDate = /4b\.\s*(\d{2}\.\d{2}\.\d{4})/;
    const regexCNP = /4d\.\s*(\d{13})/;

    const matchName = text.match(regexName);
    const matchFirstName = text.match(regexFirstName);
    const matchIssueDate = text.match(regexIssueDate);
    const matchExpirationDate = text.match(regexExpirationDate);
    const matchCNP = text.match(regexCNP);

    return {
        lastname: matchName ? matchName[1].replace(/\r?\n.*/, '').trim() : 'undetected',
        firstname: matchFirstName ? matchFirstName[1].replace(/\r?\n.*/, '').trim() : 'undetected',
        issueDate: matchIssueDate ? matchIssueDate[1] : 'undetected',
        expirationDate: matchExpirationDate ? matchExpirationDate[1] : 'undetected',
        CNP: matchCNP ? matchCNP[1] : 'undetected',
    }
}

const sendDocuments = async (req, res, next) => {
    try {
        const files = req.files;
        const idCard = files['id-card'][0].destination + files['id-card'][0].filename;
        const driverLicense = files['driver-license'][0].destination + files['driver-license'][0].filename;
        const user = await models.User.findOne({
            _id: req.user._id,
        });
        user.idCard = idCard;
        user.driverLicense = driverLicense;
        await user.save();

        if(Object.keys(files).length !== 2) {
            return res.status(400).json({
                message: "ID Card or driver's license was not uploaded, please try again!",
            })
        }

        const idCardFilePath = files['id-card'][0].path;

        let idCardData;
        const preprocessedIdCard = await preprocessIDCard(idCardFilePath);
        await tesseract.recognize(preprocessedIdCard, config)
                                            .then((text) => {
                                                idCardData = extractIDCardData(text);
                                            })
                                            .catch((error) => {
                                                console.log(error)
                                            });

        const driverLicenseFilePath = files['driver-license'][0].path;
        const preprocessedDriverLicense = await preprocessDriverLicense(driverLicenseFilePath);

        let driverInfo;
        await tesseract.recognize(preprocessedDriverLicense, config)
                                            .then((text) => {
                                                driverInfo = extractDriverLicenseData(text);
                                            })
                                            .catch((error) => {
                                                console.log(error)
                                            });

        req.user.statusAccountVerified = 'pending';
        await req.user.save(); 

        req.user.driverInfo = driverInfo;
        req.user.idCardInfo = idCardData;

        next();
    } catch (err) {
        next(err);
    }
}

const checkDocuments = async (req, res, next) => {
    try {
        const driverInfo = req.user.driverInfo;
        const idCardInfo = req.user.idCardInfo;
        const user = req.user;

        let validDocuments = true;

        if (driverInfo.firstname === 'undetected' && idCardInfo.firstname === 'undetected') {
            validDocuments = false;
        }

        if (driverInfo.lastname === 'undetected' && idCardInfo.lastname === 'undetected') {
            validDocuments = false;
        }

        if (driverInfo.CNP === 'undetected' && idCardInfo.CNP === 'undetected') {
            validDocuments = false;
        }

        if (driverInfo.firstname !== 'undetected' && driverInfo.firstname.toLowerCase() !== user.firstname.toLowerCase()) {
            validDocuments = false;
        }

        if (idCardInfo.firstname !== 'undetected' && idCardInfo.firstname.toLowerCase() !== user.firstname.toLowerCase()) {
            validDocuments = false;
        }

        if (driverInfo.lastname !== 'undetected' && driverInfo.lastname.toLowerCase() !== user.lastname.toLowerCase()) {
            validDocuments = false;
        }

        if (idCardInfo.lastname !== 'undetected' && idCardInfo.lastname.toLowerCase() !== user.lastname.toLowerCase()) {
            validDocuments = false;
        }

        let userCNP;
        if (driverInfo.CNP !== 'undetected') {
            userCNP = driverInfo.CNP;
        } else if (idCardInfo.CNP !== 'undetected') {
            userCNP = idCardInfo.CNP;
        }

        if (userCNP !== undefined) {
            const cnpYear = parseInt(userCNP.substring(1, 3));
            const cnpMonth = parseInt(userCNP.substring(3, 5)) - 1;
            const cnpDay = parseInt(userCNP.substring(5, 7));
            const cnpDate = new Date(Date.UTC(cnpYear, cnpMonth, cnpDay));

            const currentDate = new Date(Date.now());
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();

            let age = year - cnpDate.getUTCFullYear();
            const months = month - cnpDate.getUTCMonth();

            if (months < 0 || (months === 0 && day < cnpDate.getUTCDate())) {
                age--;
            }

            if (age < 18) {
                validDocuments = false;
            }
        }

        if (validDocuments === false) {
            req.user.statusAccountVerified = 'rejected';
            await req.user.save();
            return res.status(400).json({
                message: 'The documents you submitted were rejected!',
            });
        } else {
            req.user.statusAccountVerified = 'approved';
            req.user.driverLicenseExpirationDate = driverInfo.expirationDate;
            req.user.idCardExpirationDate = idCardInfo.expirationDate;
            await req.user.save();
            return res.status(200).json({
                message: 'The documents have been validated! Now you can enjoy our services!',
            });
        }
    } catch(err) {
        next(err);
    }
}

export default {
    userInformation,
    savePhoneNumber,
    sendDocuments,
    checkDocuments,
}