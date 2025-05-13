import { ref, get, remove } from "firebase/database";
import { database } from "../models/index.js";
import dayjs from "dayjs";

const deleteIncompleteConversation = async () => {
    try {
        const currentDate = dayjs();

        const conversationsRef = ref(database, 'conversations');
        const snapshot = await get(conversationsRef);

        let deletedConversations = 0;
        let children = [];

        snapshot.forEach(child => {
            children.push(child);
        });

        for (const conversationSnap of children) {
            const conversation = conversationSnap.val();
            const messages = Object.values(conversation.messages || {});
            const conversationId = conversationSnap.key;
            const conversationStartingTime = conversationId.split('-')[1];
            const conversationStartDate = dayjs(Number(conversationStartingTime));
            if (messages.length <= 1 && (((conversation.status === 'closed' || conversation.status === 'solved' ) && conversation.category === 'unknown') || (currentDate.diff(conversationStartDate, 'minute') > 30 && conversation.status === 'open'))) {
                const convRef = ref(database, `conversations/${conversationId}`);
                await remove(convRef);
                deletedConversations++;
            }
        }

        console.log(`Today - ${currentDate.format("DD-MM-YYYY HH:mm")} - deleted ${deletedConversations} conversations`);
    } catch (err) {
        console.log("Cron-job delete incomplete conversations error: " + err);
    }
}

export default {
    deleteIncompleteConversation,
}