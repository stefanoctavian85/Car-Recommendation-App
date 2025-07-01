import { database } from "../../models/index.js";
import { ref, set, get, push, update } from 'firebase/database';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { SERVER } from '../../utils/global.js';
import fetch from 'node-fetch';
import models from "../../models/index.js";
import path from "path";
import utils from "../../utils/index.js";
import mongoose from "mongoose";

const sendFirstMessage = async (req, res, next) => {
    const userId = req.user._id.toString();
    const userFullName = req.user.firstname + " " + req.user.lastname;
    let startingConversationTime = Date.now();
    try {
        const conversationId = `${userId}-${startingConversationTime}`;
        const newConversation = {
            userFullName: userFullName,
            userId: userId,
            status: 'open',
            category: 'unknown',
            messages: {},
        };
        const conversationRef = ref(database, `conversations/${conversationId}`);
        await set(conversationRef, newConversation);
        const messageRef = ref(database, `conversations/${conversationId}/messages`);

        startingConversationTime = new Date(startingConversationTime).toISOString();
        const welcomeMessageId = uuid();
        const welcomeMessage = {
            type: 'text',
            messageId: welcomeMessageId,
            sender: "AI",
            message: "Write a short description of the problem you are facing!",
            timestamp: startingConversationTime,
        }
        await push(messageRef, welcomeMessage);

        return res.status(200).json({
            message: "Conversation started successfully!",
            conversationId,
        });
    } catch (err) {
        next(err);
    }
}

const sendMessage = async (req, res, next) => {
    const { message, conversationId } = req.body;
    const userFullName = req.user.firstname + " " + req.user.lastname;
    try {
        const conversationRef = ref(database, `conversations/${conversationId}`);
        const snapshot = await get(conversationRef);
        const conversation = snapshot.val();

        let flaskResponse, response;

        if (conversation.category === 'unknown' || conversation.category === 'others') {
            try {
                flaskResponse = await fetch(`${SERVER}/chatbot/categorize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify({ message })
                });

                if (flaskResponse.ok) {
                    response = await flaskResponse.json();
                    const conversationRef = ref(database, `conversations/${conversationId}`);
                    await update(conversationRef, { category: response.category });
                }
            } catch (error) {
                console.log("Flask server is not reachable!");
            }
        }

        const messageId = uuid();
        const newMessage = {
            type: 'text',
            messageId: messageId,
            senderFullName: userFullName,
            sender: req.user.status,
            message: message,
            timestamp: dayjs().toISOString(),
        };

        if (conversationId) {
            const messageRef = ref(database, `conversations/${conversationId}/messages`);
            await push(messageRef, newMessage);
        } else {
            return res.status(404).json({
                message: "Conversation not found!",
            })
        }

        res.status(200).json({
            message: "Message sent successfully!",
        });
    } catch (err) {
        next(err);
    }
}

const attachFilesToConversation = async (req, res, next) => {
    try {
        const files = req.files;
        const conversationId = req.body.conversationId;
        const userFullName = req.user.firstname + " " + req.user.lastname;

        let newMessage = {};
        if (conversationId) {
            const messageRef = ref(database, `conversations/${conversationId}/messages`);
            const documents = files.map((file) => (
                file.destination + file.filename
            ));

            const messageId = uuid();
            newMessage = {
                type: 'document',
                messageId: messageId,
                senderFullName: userFullName,
                sender: req.user.status,
                message: `${userFullName} uploaded ${files.length} documents to this conversation.`,
                documents: documents,
                timestamp: dayjs().toISOString(),
            };
            await push(messageRef, newMessage);
        } else {
            return res.status(404).json({
                message: "Conversation not found!",
            })
        }

        res.status(200).json({
            message: "Message sent successfully!",
        });
    } catch (err) {
        next(err);
    }
}

const downloadDocuments = async (req, res, next) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(utils.pathUtils.filesRootPath, "uploads", filename);

        res.download(filePath, (error) => {
            if (error) {
                console.error(error);
                res.status(500).json({
                    message: 'Internal Server Error',
                });
            }
        })
    } catch (err) {
        next(err);
    }
}

const closeChat = async (req, res, next) => {
    const { conversationId } = req.body;

    try {
        if (conversationId) {
            const conversationRef = ref(database, `conversations/${conversationId}`);
            if (req.user.status === 'admin') {
                await update(conversationRef, { status: 'solved' });
            } else {
                await update(conversationRef, { status: 'closed' });
            }

            return res.status(200).json({
                message: "Conversation closed!",
            });
        } else {
            return res.status(404).json({
                message: "Conversation not found!",
            });
        }
    } catch (err) {
        next(err);
    }
}

const getConversationInfo = async (req, res, next) => {
    const { conversationId } = req.params;

    try {
        const conversationRef = ref(database, `conversations/${conversationId}`);
        const snapshot = await get(conversationRef);
        const conversation = snapshot.val();

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found!",
            });
        }

        let conversationInfo = {
            userId: conversation.userId,
            userFullName: conversation.userFullName,
            category: conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1).toLowerCase(),
            status: conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1).toLowerCase(),
        }

        const userId = conversation.userId;

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    message: 'Something went wrong! Please try again later!',
                });
            }

            const userInfo = await models.User.findOne({
                _id: userId,
            });

            conversationInfo = {
                ...conversationInfo,
                'email': userInfo.email,
                'userStatus': userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1).toLowerCase(),
                'phoneNumber': userInfo.phoneNumber,
                'documentsStatus': userInfo.statusAccountVerified.charAt(0).toUpperCase() + userInfo.statusAccountVerified.slice(1).toLowerCase()
            };

            return res.status(200).json({
                conversationInfo,
            });
        } else {
            return res.status(400).json({
                message: "Missing user id",
            });
        }
    } catch (err) {
        next(err);
    }
}

const approveDocumentsByAdmin = async (req, res, next) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(404).json({
                message: "Missing user id",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(uid)) {
            return res.status(400).json({
                message: 'Something went wrong! Please try again later!',
            });
        }
        
        const user = await models.User.findOne({
            _id: uid,
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        user.statusAccountVerified = 'approved';
        await user.save();

        return res.status(200).json({
            message: "User's documents status has been changed successfully!",
        });
    } catch (err) {
        next(err);
    }
}

export default {
    sendFirstMessage,
    sendMessage,
    attachFilesToConversation,
    downloadDocuments,
    closeChat,
    getConversationInfo,
    approveDocumentsByAdmin,
}