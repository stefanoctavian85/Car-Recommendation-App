import './Chat.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, FormControl, IconButton, List, ListItem, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import Input from '@mui/joy/Input';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SERVER } from '../../config/global.jsx';
import { firebaseConfig } from '../../config/firebase.jsx';
import AppContext from '../../state/AppContext.jsx';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import { jwtDecode } from 'jwt-decode';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

function Chat() {
    const { auth } = useContext(AppContext);
    const startingTimeRef = useRef(null);
    const lastMessageRef = useRef(null);

    const [isChatOpen, setIsChatOpen] = useState(false);

    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isConversationStarted, setIsConversationStarted] = useState(false);
    const [startingConversationTime, setStartingConversationTime] = useState('');

    useEffect(() => {
        if (isChatOpen === true && isConversationStarted === false) {
            setIsConversationStarted(true);
            const startingTime = Date.now();
            startingTimeRef.current = startingTime;
            setStartingConversationTime(startingTime);
            fetch(`${SERVER}/api/chat/send-AI-first-message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startingConversationTime: startingTime })
            });
        }
    }, [isChatOpen]);

    useEffect(() => {
        let userId;
        if (!auth.authStore.user._id) {
            userId = jwtDecode(auth.token).id;
        } else {
            userId = auth.authStore.user._id;
        }
        const conversationRef = ref(database, `conversations/${userId}-${startingConversationTime}/messages`);

        onValue(conversationRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray = Object.values(data);
                setConversation(messagesArray);
                console.log(messagesArray);
            } else {
                setConversation([]);
            }
        })
    }, [startingConversationTime]);

    useEffect(() => {
        scrollToLastMessage();
    }, [conversation]);

    function scrollToLastMessage() {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function toggleChat() {
        setIsChatOpen(!isChatOpen);
    }

    async function closeChat(e) {
        if (isConversationStarted) {
            const response = await fetch(`${SERVER}/api/chat/close-conversation`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startingConversationTime: startingTimeRef.current })
            });
        }
        setIsChatOpen(false);
        setStartingConversationTime('');
        setIsConversationStarted(false);
        startingTimeRef.current = null;
    }

    async function sendMessage() {
        if (message.trim() === '') return;

        try {
            const response = await fetch(`${SERVER}/api/chat/send-message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, startingConversationTime: startingTimeRef.current })
            });
            setMessage('');
        } catch (err) {
            console.log(err);
        }
    }

    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <Box className='chat-box'>
            {
                isChatOpen === false ? (
                    <Box className='chat-closed'>
                        <IconButton
                            className='chat-button-open'
                            onClick={toggleChat}
                        >
                            <ChatIcon className='chat-icon' />
                        </IconButton>
                    </Box>
                ) : (
                    <Box className='chat-open'>
                        <Box className='chat-bar'>
                            <Box className='chat-left-bar'>
                                <Typography className='char-bar-title'>Support Chat</Typography>
                            </Box>
                            <Box className='chat-right-bar'>
                                <IconButton className='chat-button-minimize'>
                                    <MinimizeIcon className='chat-button-icon' onClick={toggleChat} />
                                </IconButton>
                                <IconButton className='chat-button-close'>
                                    <CloseIcon className='chat-button-icon' onClick={closeChat} />
                                </IconButton>
                            </Box>
                        </Box>
                        <Box className='chat-history-messages'>
                            {
                                conversation.length > 0 ? (
                                    <Box className='chat-conversation'>
                                        <List className='chat-messages'>
                                            {
                                                conversation.map((message, index) => {
                                                    const isLastMessage = index === conversation.length - 1;
                                                    return (
                                                        <ListItem className='chat-message' key={index} ref={isLastMessage ? lastMessageRef : null}>
                                                            {
                                                                message.sender === 'AI' ? (
                                                                    <Box className='chat-message-AI'>
                                                                        <Typography className='message'>{message.message}</Typography>
                                                                    </Box>
                                                                ) : null
                                                            }

                                                            {
                                                                message.sender === 'regular' ? (
                                                                    <Box className='chat-message-regular'>
                                                                        <Typography className='message'>{message.message}</Typography>
                                                                    </Box>
                                                                ) : null
                                                            }

                                                            {
                                                                message.sender === 'admin' ? (
                                                                    <Box className='chat-message-admin'>
                                                                        <Typography className='message'>{message.message}</Typography>
                                                                    </Box>
                                                                ) : null
                                                            }
                                                        </ListItem>
                                                    )
                                                })
                                            }
                                        </List>
                                    </Box>
                                ) : null
                            }
                        </Box>
                        <Box className='chat-input-message'>
                            <Box className='input-form' component='form'>
                                <FormControl className='chat-input'>
                                    <Input
                                        className='chat-input-buttons'
                                        onChange={(e) => setMessage(e.target.value)}
                                        value={message}
                                        onKeyDown={handleEnterKey}
                                        endDecorator={
                                            <>
                                                <IconButton>
                                                    <AttachFileIcon className='chat-input-button' />
                                                </IconButton>
                                                <IconButton>
                                                    <SendIcon className='chat-input-button' onClick={() => sendMessage()} />
                                                </IconButton>
                                            </>
                                        }
                                    >
                                    </Input>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                )

            }
        </Box>
    );
}

export default Chat;