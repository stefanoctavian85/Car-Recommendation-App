import './AdminConversations.css';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Button } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../state/AppContext';
import { DataGrid } from '@mui/x-data-grid';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../config/firebase';
import { getDatabase, onValue, ref } from 'firebase/database';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

const FILTER_OPTIONS = [{
    label: 'All',
    value: 'all',
}, {
    label: 'Account',
    value: 'account',
}, {
    label: 'Accident',
    value: 'accident',
}, {
    label: 'Feedback',
    value: 'feedback',
}, {
    label: 'Form',
    value: 'form',
}, {
    label: 'Payment',
    value: 'payment',
}, {
    label: 'Search',
    value: 'search',
}, {
    label: 'Others',
    value: 'others',
}];

const columns = [{
    field: 'id',
    headerName: 'ID',
    width: 150,
}, {
    field: 'fullname',
    headerName: 'Full name',
    width: 200,
}, {
    field: 'category',
    headerName: 'Category',
    width: 150,
}, {
    field: 'status',
    headerName: 'Status',
    width: 150,
}, {
    field: 'descriptionMessage',
    headerName: 'Description message',
    width: 300,
}];

function AdminConversations({ router }) {
    const { auth } = useContext(AppContext);

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [conversations, setConversations] = useState([]);

    const [selectedConversationIndex, setSelectedConversationIndex] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (auth.authStore.user.status === 'admin') {
            const conversationsRef = ref(database, 'conversations');

            onValue(conversationsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    let conversationsArray = [];
                    conversationsArray = Object.entries(data);
                    const rows = conversationsArray.
                        filter(([_, conversation]) => (
                            categoryFilter === 'all' || conversation.category === categoryFilter
                        )).
                        map(([key, conversation]) => {
                            const messagesArray = Object.entries(conversation.messages);
                            let descriptionMessage;
                            if (messagesArray.length > 1) {
                                descriptionMessage = messagesArray[1][1].message || '';
                            }
                            return {
                                id: key,
                                fullname: conversation.userFullName || '',
                                category: conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1).toLowerCase() || '',
                                status: conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1).toLowerCase()  || '',
                                descriptionMessage: descriptionMessage || '',
                            }
                        });
                    setConversations(rows);
                } else {
                    setConversations([]);
                }
            })
        }
    }, [categoryFilter]);

    function solveConversation() {
        if (selectedConversationIndex) {
            setErrorMessage('');
            router.navigate('/solve-conversation', {
                state: {
                    conversationId: selectedConversationIndex,
                }
            });
        } else {
            setErrorMessage('You have to select a conversation!');
        }
    }

    return (
        <Box className='admin-conversations-page'>
            <Box className='admin-conversations-input'>
                <FormControl className='admin-conversations-filter-form'>
                    <InputLabel id='category-filter-label'>Category</InputLabel>
                    <Select
                        labelId='category-filter-label'
                        className='category-filter-select'
                        value={categoryFilter}
                        label='Category'
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {
                            FILTER_OPTIONS.map((element) => (
                                <MenuItem value={element.value}>{element.label}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Box>

            {
                conversations.length > 0 ? (
                    <Box>
                        <DataGrid
                            className='admin-conversations-table'
                            columns={columns}
                            rows={conversations}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[10]}
                            checkboxSelection
                            disableMultipleRowSelection
                            keepNonExistentRowsSelected
                            onRowSelectionModelChange={(index) => {
                                if (index.length > 0) {
                                    setSelectedConversationIndex(index[0])
                                }
                            }}
                        />
                        <Box className='solve-conversation'>
                            <Button
                                className='solve-conversation-button'
                                onClick={solveConversation}
                                variant='contained'
                            >
                                Solve ticket
                            </Button>
                        </Box>
                    </Box>
                ) : <Box className='no-data-grid'>
                    <Typography className='no-data-text'>There are no conversations for the selected category.</Typography>
                </Box>
            }

            <Box className='conversations-error'>
                <Typography className='admin-conversations-error-message'>{errorMessage}</Typography>
            </Box>
        </Box>
    );
}

export default AdminConversations;