import './Chat.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { Box, FormControl, IconButton, List, ListItem, Typography, Input, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SERVER } from '../../config/global.jsx';
import { firebaseConfig } from '../../config/firebase.jsx';
import AppContext from '../../state/AppContext.jsx';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import DownloadIcon from '@mui/icons-material/Download';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

const closeChatAlertDialog = "Keep in mind that you will lose the conversation and will not be able to receive a response. If you dont want this, just minimize the chat!";
const adminCloseChatAlertDialog = "Close this conversation only if you have solved the user's problem, otherwise the problem will remain unresolved!";

function Chat({ adminConversationId }) {
    const { auth } = useContext(AppContext);
    const lastMessageRef = useRef(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCloseChatDialogOpen, setIsCloseChatDialogOpen] = useState(false);

    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [conversationId, setConversationId] = useState('');
    const [conversationStatus, setConversationStatus] = useState('');

    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (isChatOpen === true && conversationId === '' && auth.authStore.user.status !== 'admin') {
            fetch(`${SERVER}/api/chat/send-AI-first-message`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setConversationId(data.conversationId);
                    setConversationStatus('open');
                });
        } else if (auth.authStore.user.status === 'admin' && adminConversationId !== '') {
            setIsChatOpen(true);
            setConversationId(adminConversationId);
            const conversationRef = ref(database, `conversations/${adminConversationId}`);
            onValue(conversationRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setConversationStatus(data.status);
                    const messagesArray = Object.values(data.messages);
                    setConversation(messagesArray);
                } else {
                    setConversation([]);
                }
            })
        }
    }, [isChatOpen]);

    useEffect(() => {
        const conversationRef = ref(database, `conversations/${conversationId}/messages`);

        onValue(conversationRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray = Object.values(data);
                setConversation(messagesArray);
            } else {
                setConversation([]);
            }
        })
    }, [conversationId]);

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

    async function closeChat() {
        setIsCloseChatDialogOpen(false);
        if (conversationId) {
            await fetch(`${SERVER}/api/chat/close-conversation`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId })
            });
        }
        setConversationId('');
        setConversation([]);
        setIsChatOpen(false);
    }

    async function sendMessage() {
        if (message.trim() === '' && documents.length === 0) return;

        try {
            if (message.trim() !== '') {
                await fetch(`${SERVER}/api/chat/send-message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, conversationId })
                })
                    .finally(() => {
                        setMessage('');
                    })
            }

            if (documents.length > 0) {
                const formData = new FormData();
                formData.append('conversationId', conversationId);
                documents.forEach((doc) => {
                    formData.append('documents', doc);
                });
                fetch(`${SERVER}/api/chat/attach-documents`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                    },
                    body: formData,
                })
                    .finally(() => {
                        setDocuments([]);
                    });
            }
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

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
        setDocuments((prevDocs) => ([
            ...prevDocs,
            ...files,
        ]));
    }

    function downloadDocuments(message) {
        for (const doc of message.documents) {
            const filename = doc.split('/').pop();
            fetch(`${SERVER}/api/chat/download-documents/${filename}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                },
            })
                .then((res) => {
                    if (res.ok) {
                        return res.blob();
                    }
                })
                .then((blob) => {
                    if (blob) {
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                })
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
                            {
                                auth.authStore.user.status === 'regular' ? (
                                    <Box className='chat-right-bar'>
                                        <IconButton
                                            className='chat-button-minimize'
                                            onClick={toggleChat}
                                        >
                                            <MinimizeIcon className='chat-button-icon' />
                                        </IconButton>
                                        <IconButton
                                            className='chat-button-close'
                                            onClick={() => setIsCloseChatDialogOpen(true)}
                                        >
                                            <CloseIcon className='chat-button-icon' />
                                        </IconButton>
                                    </Box>
                                ) : null
                            }
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
                                                                        <Typography className='message-text'>{message.message}</Typography>
                                                                    </Box>
                                                                ) : null
                                                            }

                                                            {
                                                                message.sender === 'regular' ? (
                                                                    <Box className='chat-message-regular'>
                                                                        {
                                                                            message.type === 'text' && (
                                                                                <Typography className='message-text'>{message.message}</Typography>
                                                                            )
                                                                        }

                                                                        {
                                                                            message.type === 'document' && (
                                                                                <Box className='chat-message-regular-documents'>
                                                                                    <Typography className='message-text'>{message.message}</Typography>
                                                                                    <Box className='document-message-right-part'>
                                                                                        <IconButton
                                                                                            className='chat-button-open'
                                                                                            onClick={() => downloadDocuments(message)}
                                                                                        >
                                                                                            <DownloadIcon className='chat-icon' />
                                                                                        </IconButton>
                                                                                    </Box>
                                                                                </Box>
                                                                            )
                                                                        }
                                                                    </Box>
                                                                ) : null
                                                            }

                                                            {
                                                                message.sender === 'admin' ? (
                                                                    <Box className='chat-message-admin'>
                                                                        <Typography className='message-text'>{message.message}</Typography>
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
                        {
                            conversationStatus === 'open' ? (
                                <Box className='chat-input-message'>
                                    <Box className='input-form' component='form'>
                                        <FormControl className='chat-input'>
                                            <Input
                                                className='chat-input-buttons'
                                                onChange={(e) => setMessage(e.target.value)}
                                                value={message}
                                                onKeyDown={handleEnterKey}
                                                required
                                                disableUnderline
                                                endAdornment={
                                                    <InputAdornment position='end'>
                                                        <FormControl className='chat-documents-input'>
                                                            <IconButton component='label' className='chat-input-button'>
                                                                <AttachFileIcon />
                                                                <input
                                                                    className='input-file'
                                                                    type='file'
                                                                    accept="image/jpeg, image/png"
                                                                    onChange={handleFileChange}
                                                                    multiple
                                                                />
                                                            </IconButton>
                                                        </FormControl>
                                                        <IconButton
                                                            onClick={sendMessage}
                                                        >
                                                            <SendIcon
                                                                className='chat-input-button'
                                                            />
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            >
                                            </Input>
                                        </FormControl>
                                    </Box>
                                </Box>
                            ) : null
                        }

                    </Box>
                )
            }

            <Box className='close-chat-dialog'>
                <Dialog
                    open={isCloseChatDialogOpen}
                    onClose={closeChat}
                >
                    <DialogTitle>
                        {"Are you sure you want to close the chat?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {
                                auth.authStore.user.status === 'regular' ? closeChatAlertDialog : adminCloseChatAlertDialog
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions className='dialog-buttons'>
                        <Button className='dialog-button' autoFocus onClick={() => setIsCloseChatDialogOpen(false)} variant='contained'>
                            Back
                        </Button>
                        <Button className='dialog-button' autoFocus onClick={closeChat} variant='contained'>
                            Close chat
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default Chat;