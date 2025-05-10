import { Box, Button, Typography } from '@mui/material';
import './Ticket.css';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global.jsx';
import Chat from '../Chat/Chat.jsx';

function Ticket({ state, router }) {
    const { auth } = useContext(AppContext);

    const [conversationId, setConversationId] = useState('');
    const [conversationInfo, setConversationInfo] = useState({});

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
    }, [state]);

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
                    <Typography className='ticket-user-detail'>{conversationInfo.userFullName}</Typography>
                    <Typography className='ticket-user-detail'>{conversationInfo.email}</Typography>
                    <Typography className='ticket-user-detail'>{conversationInfo.phoneNumber}</Typography>
                    <Typography className='ticket-user-detail'>{conversationInfo.userStatus}</Typography>
                    <Typography className='ticket-user-detail'>{conversationInfo.documentsStatus}</Typography>
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
                    <Button
                        className='ticket-solve-button'
                        variant='contained'
                        onClick={closeChat}
                    >Solve</Button>
                </Box>
            </Box>

            <Box className='ticket-chat'>
                <Chat adminConversationId={state.conversationId} />
            </Box>
        </Box>
    );
}

export default Ticket;