import { Box, Button, Typography } from '@mui/material';
import './Ticket.css';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global.jsx';
import Chat from '../Chat/Chat.jsx';

function Ticket({ state, router }) {
    const { auth } = useContext(AppContext);

    const [conversationId, setConversationId] = useState('');
    const [conversationInfo, setConversationInfo] = useState({});

    const [documentsMessage, setDocumentsMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (state && state.conversationId && auth.token) {
            setConversationId(state.conversationId);
            fetch(`${SERVER}/api/chat/get-conversation-info/${state.conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setConversationInfo(data.conversationInfo);
                });
        } else {
            navigate('/');
        }
    }, [state, conversationInfo]);

    async function closeChat() {
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
        router.navigate('/tickets');
    }

    async function approveDocuments() {
        if (conversationId) {
            await fetch(`${SERVER}/api/chat/approve-documents`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: conversationInfo.id })
            })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setDocumentsMessage(data.message);
            })
            .catch((error) => {
                console.log("Error: " + error.message);
                setDocumentsMessage("An error occured! Please try again later!");
            });
        }
    }

    return (
        <Box className='solve-ticket-page'>
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
    );
}

export default Ticket;