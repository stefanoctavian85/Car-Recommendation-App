import { database } from "../../models/index.js";
import { ref, set, get, push, update } from 'firebase/database';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { SERVER } from '../../utils/global.js';
import fetch from 'node-fetch';

const sendFirstMessage = async (req, res, next) => {
    let { startingConversationTime } = req.body;
    const userId = req.user._id.toString();

    try {;
        const conversationId = `${userId}-${startingConversationTime}`;
        const newConversation = {
            userId: userId,
            status: 'open',
            category: 'unknown',
            messages: {}
        };
        const conversationRef = ref(database, `conversations/${conversationId}`);
        await set(conversationRef, newConversation);
        const messageRef = ref(database, `conversations/${conversationId}/messages`);

        startingConversationTime = new Date(startingConversationTime).toISOString()
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
        });
    } catch (err) {
        next(err);
    }
}

const sendMessage = async (req, res, next) => {
    const { message, startingConversationTime } = req.body;
    const userId = req.user._id.toString();

    try {
        const conversations = ref(database, 'conversations');
        const snapshot = await get(conversations);

        let conversationId;
        let flaskResponse, response;
        let conversation = '';
        let children = [];

        snapshot.forEach(child => {
            children.push(child);
        });

        for (const child of children) {
            const convCopy = child.val();
            const conversationTime = child.key.split("-")[1];
            if (convCopy.userId === userId && convCopy.status === 'open' && startingConversationTime == conversationTime) {
                conversationId = child.key;
                conversation = convCopy;
                break;    
            }
        }

        if (conversation.category === 'unknown') {
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
    const { startingConversationTime } = req.body;
    const userId = req.user._id.toString();
    const conversationId = `${userId}-${startingConversationTime}`;
    try {
        if (startingConversationTime) {
            const conversationRef = ref(database, `conversations/${conversationId}`);
            await update(conversationRef, { status: 'closed' });

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

export default {
    sendFirstMessage,
    sendMessage,
    closeChat
}