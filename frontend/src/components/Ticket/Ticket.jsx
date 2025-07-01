import { Box, Button, Typography } from '@mui/material';
import './Ticket.css';
import { useContext, useEffect, useState } from 'react';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global.jsx';
import Chat from '../Chat/Chat.jsx';

function Ticket({ state, router }) {
    const { auth } = useContext(AppContext);

    const [conversationId, setConversationId] = useState('');
    const [conversationInfo, setConversationInfo] = useState({});

    const [documentsMessage, setDocumentsMessage] = useState("");
    const [error, setError] = useState('');

    useEffect(() => {
        if (state && state.conversationId && auth.token) {
            setConversationId(state.conversationId);
            fetch(`${SERVER}/api/chat/get-conversation-info/${state.conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok) {
                        setError('');
                        setConversationInfo(data.conversationInfo);
                                    console.log(data.conversationInfo)
                    } else {
                        setError(data.message);
                    }
                })
                .catch((error) => {
                    setError(error.message || "Something went wrong!")
                });
        } else {
            setError("Conversation not found!");
        }
    }, [state, auth.token]);

    async function closeChat() {
        if (conversationId) {
            try {
                const response = await fetch(`${SERVER}/api/chat/close-conversation`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ conversationId })
                });

                const data = await response.json();
                if (response.ok) {
                    setError('');
                    router.navigate('/tickets');
                } else {
                    setError(data.message || "Something went wrong!");
                }
            } catch (err) {
                setError(err);
            }
        }
    }

    async function approveDocuments() {
        if (conversationId) {
            await fetch(`${SERVER}/api/chat/approve-documents`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: conversationInfo.userId })
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok) {
                        setError('');
                        setDocumentsMessage(data.message);
                    } else {
                        setError(data.message);
                    }
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }

    return (
        <Box className='solve-ticket-page'>
            {
                !error ? (
                    <Box>
                        <Box className='user-ticket-info'>
                            <Box className='user-info-left-part'>
                                <Typography className='ticket-user-info'>Full name</Typography>
                                <Typography className='ticket-user-info'>Email</Typography>
                                <Typography className='ticket-user-info'>Phone number</Typography>
                                <Typography className='ticket-user-info'>Account status</Typography>
                                <Typography className='ticket-user-info'>Documents status</Typography>
                            </Box>
                            <Box className='user-info-right-part'>
                                <Typography className='ticket-user-detail'>{conversationInfo.userFullName || "-"}</Typography>
                                <Typography className='ticket-user-detail'>{conversationInfo.email || "-"}</Typography>
                                <Typography className='ticket-user-detail'>{conversationInfo.phoneNumber || "-"}</Typography>
                                <Typography className='ticket-user-detail'>{conversationInfo.userStatus || "-"}</Typography>
                                <Typography className='ticket-user-detail'>{conversationInfo.documentsStatus || "-"}</Typography>
                            </Box>
                        </Box>

                        <Box className='ticket-box'>
                            <Box className='ticket-info'>
                                <Box className='ticket-info-left-part'>
                                    <Typography className='ticket-user-info'>Ticket category</Typography>
                                    <Typography className='ticket-user-info'>Ticket status</Typography>
                                </Box>
                                <Box className='ticket-info-right-part'>
                                    <Typography className='ticket-user-detail'>{conversationInfo.category}</Typography>
                                    <Typography className='ticket-user-detail'>{conversationInfo.status}</Typography>
                                </Box>
                            </Box>

                            <Box className='ticket-buttons'>
                                {
                                    conversationInfo.documentsStatus !== "Approved" && (
                                        <Box className='ticket-button'>
                                            <Button
                                                className='ticket-approve-documents'
                                                variant='contained'
                                                onClick={approveDocuments}
                                            >Approve documents</Button>
                                        </Box>
                                    )
                                }

                                {
                                    conversationInfo.status === 'Open' && (
                                        <Box className='ticket-button'>
                                            <Button
                                                className='ticket-solve-button'
                                                variant='contained'
                                                onClick={closeChat}
                                            >Solve</Button>
                                        </Box>
                                    )
                                }
                            </Box>

                            <Box className='documents-message'>
                                <Typography className='documents-message-text'>{documentsMessage}</Typography>
                            </Box>
                        </Box>

                        <Box className='ticket-chat-box'>
                            <Chat className='ticket-chat' adminConversationId={state.conversationId} />
                        </Box>
                    </Box>
                ) : (
                    <Box className='no-data-grid'>
                        <Typography className='no-data-text'>{error}</Typography>
                    </Box>
                )
            }
        </Box>
    );
}

export default Ticket;