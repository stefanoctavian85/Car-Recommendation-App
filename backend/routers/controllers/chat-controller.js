import { database } from "../../models/index.js";
import { ref, set, get, push, update } from 'firebase/database';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { SERVER } from '../../utils/global.js';
import fetch from 'node-fetch';
import models from "../../models/index.js";

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
        const conversations = ref(database, 'conversations');
        const snapshot = await get(conversations);

        let flaskResponse, response;
        let conversation = '';
        let children = [];

        snapshot.forEach(child => {
            children.push(child);
        });

        for (const child of children) {
            const convCopy = child.val();
            if (child.key === conversationId && convCopy.status === 'open') {
                conversation = convCopy;
                break;    
            }
        }

        if (conversation.category === 'unknown' || conversation.category === 'others') {
            flaskResponse = await fetch(`${SERVER}/chatbot/categorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({ message })
            });
            response = await flaskResponse.json();
            const conversationRef = ref(database, `conversations/${conversationId}`);
            await update(conversationRef, { category: response.category });
        }

        const messageId = uuid();
        const newMessage = {
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
                message: "Chat closed!",
            });
        } else {
            return res.status(404).json({
                message: "Chat not found!",
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
        let conversationInfo = {
            userId: conversation.userId,
            userFullName: conversation.userFullName,
            category: conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1).toLowerCase(),
            status: conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1).toLowerCase(),
        }

        const userId = conversation.userId;
        const userInfo = await models.User.findOne({
            _id: userId,
        });

        conversationInfo = { ...conversationInfo,
            'email': userInfo.email,
            'userStatus': userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1).toLowerCase(),
            'phoneNumber': userInfo.phoneNumber,
            'documentsStatus': userInfo.statusAccountVerified.charAt(0).toUpperCase() + userInfo.statusAccountVerified.slice(1).toLowerCase()
        };

        return res.status(200).json({
            conversationInfo,
        });
    } catch (err) {
        next(err);
    }
}

export default {
    sendFirstMessage,
    sendMessage,
    closeChat,
    getConversationInfo,
}