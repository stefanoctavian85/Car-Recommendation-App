import './Profile.css';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';
import { Box, Tab, Typography, Tabs, FormControl, InputLabel, Input, InputAdornment, Button } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';
import alertCircle from 'react-useanimations/lib/alertCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const profileTabs = ['My Information', 'Documents', 'Rented Cars'];

function Profile() {
    const { auth } = useContext(AppContext);
    const [accountInformation, setAccountInformation] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [phoneNumberTouched, setPhoneNumberTouched] = useState('');
    const [phoneNumberMessage, setPhoneNumberMessage] = useState('');

    const [files, setFiles] = useState({});
    const [fileMessage, setFileMessage] = useState('');

    const [valueTab, setValueTab] = useState('0');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userId = jwtDecode(auth.token).id;

        fetch(`${SERVER}/api/users/${userId}/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setAccountInformation(data.user);
            });
    }, [auth.token]);

    useEffect(() => {
        if (location.state?.valueTab) {
            setValueTab(location.state.valueTab);
        }
    }, [location.state]);

    function handleChangeTab(event, newValue) {
        setValueTab(newValue);
    }

    function validatePhoneNumber(phoneNumber) {
        const phoneNumberRegex = /^\d{10}$/;

        if (!phoneNumberRegex.test(phoneNumber)) {
            setPhoneNumberError('Phone number must be exactly 10 digits!');
            return false;
        }

        setPhoneNumberError('');
        return true;
    }

    function handlePhoneNumberChange(e) {
        const phoneNumber = e.target.value;
        setPhoneNumber(phoneNumber);
        if (phoneNumberTouched) {
            validatePhoneNumber(phoneNumber);
        }
    }

    function handlePhoneNumberLive(e) {
        setPhoneNumberTouched(true);
        validatePhoneNumber(e.target.value);
    }

    async function savePhoneNumber() {
        if (!validatePhoneNumber(phoneNumber)) {
            return;
        }

        const response = await fetch(`${SERVER}/api/users/save-phone-number`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: accountInformation._id, phoneNumber })
        });

        const data = await response.json();
        if (response.ok) {
            setPhoneNumberMessage(data.message);
        }
    }

    const handleFileChange = (e, fileType) => {
        setFiles((prevFiles) => ({
            ...prevFiles,
            [fileType]: e.target.files[0]
        }));
    }

    async function sendDocuments(e) {
        e.preventDefault();
        
        if (Object.keys(files).length < 2) {
            setFileMessage("Please upload the ID card and driver's license!");
            return;
        } else {
            setFileMessage("");
        }

        const formData = new FormData();
        formData.append("id-card", files["id-card"]);
        formData.append("driver-license", files["driver-license"]);
        
        const response = await fetch(`${SERVER}/api/users/send-documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            setFileMessage("");
        } else {
            setFileMessage(data.message);
        }
    }

    return (
        <Box className='profile-page'>
            <Box className='profile-tabs'>
                <TabContext value={valueTab}>
                    <Tabs
                        orientation='vertical'
                        variant='scrollable'
                        value={valueTab}
                        onChange={handleChangeTab}
                    >
                        {
                            profileTabs.map((tab, index) => (
                                <Tab label={tab} value={index.toString()} key={index} />
                            ))
                        }
                    </Tabs>

                    <TabPanel className='profile-info-tab' value={valueTab} index='0' hidden={valueTab !== '0'}>
                        <Box className='user-information-details'>
                            <Box className='user-info'>
                                <PersonIcon className='profile-icon' />
                                <Typography>{accountInformation.firstname} {accountInformation.lastname}</Typography>
                            </Box>
                            <Box className='user-info'>
                                <AlternateEmailIcon className='profile-icon' />
                                <Typography>{accountInformation.email}</Typography>
                            </Box>
                            <Box className='user-info'>
                                <LocalPhoneIcon className='profile-icon' />
                                {
                                    accountInformation.phoneNumber ? (
                                        <Box className='user-valid-phonenumber'>
                                            <Typography>{accountInformation.phoneNumber}</Typography>
                                        </Box>
                                    ) : (
                                        <Box className='user-invalid-phonenumber'>
                                            <FormControl className='information-input'>
                                                <InputLabel htmlFor='phone-number-input' className='information-label'>Phone number</InputLabel>
                                                <Input
                                                    id='phone-number-input'
                                                    label='Phone number'
                                                    type='text'
                                                    onChange={handlePhoneNumberChange}
                                                    onBlur={handlePhoneNumberLive}
                                                    required
                                                    endAdornment={
                                                        <InputAdornment position='end'>
                                                            {
                                                                phoneNumberTouched && (
                                                                    <>
                                                                        {
                                                                            phoneNumberError ? (
                                                                                <ErrorIcon color='error' />
                                                                            ) : phoneNumber ? (
                                                                                <CheckCircleIcon color='success' />
                                                                            ) : null
                                                                        }
                                                                    </>
                                                                )
                                                            }
                                                        </InputAdornment>
                                                    }
                                                ></Input>
                                            </FormControl>
                                            <Box className='save-phone-number-button'>
                                                <Button
                                                    variant='contained'
                                                    onClick={savePhoneNumber}
                                                >
                                                    Save
                                                </Button>
                                            </Box>
                                            <Box className='save-phone-number-message'>
                                                <Typography>{phoneNumberMessage}</Typography>
                                            </Box>
                                        </Box>
                                    )
                                }
                            </Box>
                            <Box className='user-info'>
                                <PriorityHighIcon className='profile-icon' />
                                <Typography>{accountInformation.statusAccountVerified ? accountInformation.statusAccountVerified.charAt(0).toUpperCase() + accountInformation.statusAccountVerified.slice(1) : ""}</Typography>
                            </Box>
                        </Box>
                    </TabPanel>

                    <TabPanel className='profile-documents-tab' value={valueTab} index='1' hidden={valueTab !== '1'}>
                        <Box className='user-documents-tab'>
                            {
                                accountInformation.statusAccountVerified === 'uninitialized' ? (
                                    <Box className='user-uninitialized-documents'>
                                        <Box className='user-documents-header'>
                                            <Typography className='user-documents-title'>Enter your ID card and driver's license here to rent or buy a car right now!</Typography>
                                        </Box>

                                        <Box className='form' component='form' onSubmit={sendDocuments}>
                                            <Box className='documents-form'>
                                                <FormControl className='document-input'>
                                                    <Typography>ID card</Typography>
                                                    <Button
                                                        component='label'
                                                        className='id-card-upload'
                                                        startIcon={<CloudUploadIcon />}
                                                    >
                                                        Upload file
                                                        <input
                                                            className='input-file'
                                                            type='file'
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, "id-card")}
                                                        />
                                                    </Button>
                                                </FormControl>
                                            </Box>

                                            <Box className='documents-form'>
                                                <FormControl className='document-input'>
                                                    <Typography>Driver's license</Typography>
                                                    <Button
                                                        component='label'
                                                        className='driver-license-upload'
                                                        startIcon={<CloudUploadIcon />}
                                                    >
                                                        Upload file
                                                        <input
                                                            className='input-file'
                                                            type='file'
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, "driver-license")}
                                                        />
                                                    </Button>
                                                </FormControl>
                                            </Box>

                                            <Box className='send-documents'>
                                                <Button
                                                    type='submit'
                                                    variant='contained'
                                                >Send documents</Button>
                                            </Box>

                                            <Box className='files-message'>
                                                <Typography>{fileMessage}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                ) : accountInformation.statusAccountVerified === "rejected" ? (
                                    <Box className='user-rejected-documents'>
                                        <Box className='user-documents-header'>
                                            <Typography className='user-documents-title'>The documents you submitted were rejected! Please contact us!</Typography>
                                        </Box>
                                        <UseAnimations animation={alertCircle} speed={0} />
                                    </Box>
                                ) : accountInformation.statusAccountVerified === "pending" ? (
                                    <Box className='user-pending-documents'>
                                        <Box className='user-documents-header'>
                                            <Typography className='user-documents-title'>Thank you for your interest! Your documents are being checked!</Typography>
                                        </Box>
                                        <UseAnimations animation={loading} speed={0} />
                                    </Box>
                                ) : (
                                    <Box className='user-approved-documents'>
                                        <Box className='user-documents-header'>
                                            <Typography className='user-documents-title'>The documents have been validated! Now you can enjoy our services!</Typography>
                                        </Box>
                                        <CheckCircleIcon color='success' />
                                    </Box>
                                )
                            }
                        </Box>
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    );
}

export default Profile;