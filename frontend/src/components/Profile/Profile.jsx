import './Profile.css';
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';
import { Box, Tab, Typography, Tabs, FormControl, InputLabel, Input, InputAdornment, Button, List, ListItem, Card, CardContent, FormControlLabel, Checkbox } from '@mui/material';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UseAnimations from 'react-useanimations';
import loading3 from 'react-useanimations/lib/loading3';
import alertCircle from 'react-useanimations/lib/alertCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CancelIcon from '@mui/icons-material/Cancel';
import EuroIcon from '@mui/icons-material/Euro';
import EmblaCarousel from '../GalleryCarousel/EmblaCarousel.jsx';
import dayjs from 'dayjs';
import Error from '../Error/Error.jsx';

const profileTabs = ['My Information', 'Documents', 'Rented Cars'];

function Profile() {
    const { auth, cars } = useContext(AppContext);
    const [accountInformation, setAccountInformation] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [phoneNumberTouched, setPhoneNumberTouched] = useState('');
    const [phoneNumberMessage, setPhoneNumberMessage] = useState('');

    const [files, setFiles] = useState({});
    const [fileMessage, setFileMessage] = useState('');
    const [hasAcceptedGDPR, setHasAcceptedGDPR] = useState(false);

    const [rentedCars, setRentedCars] = useState([]);

    const [valueTab, setValueTab] = useState('0');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);
        let userId = jwtDecode(auth.token)?.id;

        if (!userId) {
            const token = JSON.parse(localStorage.getItem("token"));
            userId = jwtDecode(token).id;
        }

        fetch(`${SERVER}/api/users/${userId}/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    setError('');
                    setAccountInformation(data.user);
                } else {
                    setError(data.message);
                }
            });

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [auth.token]);

    useEffect(() => {
        setIsLoading(true);

        if (location.state?.valueTab) {
            setValueTab(location.state?.valueTab);
            handleChangeTab(null, location.state?.valueTab)
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [location.state]);

    function handleChangeTab(event, newValue) {
        const userId = jwtDecode(auth.token).id;
        setValueTab(newValue);

        if (newValue === '2') {
            setIsLoading(true);
            fetch(`${SERVER}/api/reservations/get-reservations-by-id/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                },
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setRentedCars(data.rentedCars);
                });

            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
            return () => clearTimeout(timeout);
        }
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

        if (hasAcceptedGDPR === true) {
            setFileMessage("");
            if (auth.authStore.user.statusAccountVerified !== 'uninitialized') {
                setFileMessage("You have already sent the documents!");
                console.log(auth.authStore.user.statusAccountVerified);
                return;
            } else {
                setFileMessage("");
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
                setFileMessage(data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        } else {
            setFileMessage("You must agree to the processing of your documents in order to continue.");
            return;
        }
    }

    async function extendRentalPeriod(selectedCar) {
        cars.carsStore.setCar(selectedCar.car);
        cars.carsStore.setReservation(selectedCar);
        navigate('/rent-car', {
            state: {
                from: '/profile',
            }
        });
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Box className='profile-page'>
            {
                error === '' ? (
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
                                                            <Typography className='document-input-title'>ID card</Typography>
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
                                                            <Typography className='document-input-title'>Driver's license</Typography>
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

                                                    <Box className='documents-form'>
                                                        <FormControlLabel
                                                            className='section-gdpr'
                                                            control={<Checkbox
                                                                className='checkbox-gdpr'
                                                                onChange={(e) => setHasAcceptedGDPR(e.target.checked)}
                                                            />}
                                                            label={
                                                                <span className='checkbox-gdpr-label'>
                                                                    I fully agree that my documents may be processed
                                                                    for the purpose of verifying my identity and eligibility to rent a vehicle, in accordance with the
                                                                    Privacy Policy.
                                                                </span>
                                                            } />
                                                    </Box>

                                                    <Box className='send-documents'>
                                                        <Button
                                                            type='submit'
                                                            variant='contained'
                                                        >Send documents</Button>
                                                    </Box>

                                                    <Box className='files-message'>
                                                        <Typography className='file-message'>{fileMessage}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ) : accountInformation.statusAccountVerified === "rejected" ? (
                                            <Box className='user-rejected-documents'>
                                                <Box className='user-documents-header'>
                                                    <Typography className='user-documents-title'>The documents you submitted were rejected!</Typography>
                                                </Box>
                                                <UseAnimations animation={alertCircle} speed={0} className='dynamic-icon' />
                                            </Box>
                                        ) : accountInformation.statusAccountVerified === "pending" ? (
                                            <Box className='user-pending-documents'>
                                                <Box className='user-documents-header'>
                                                    <Typography className='user-documents-title'>Thank you for your interest! Your documents are being checked!</Typography>
                                                </Box>
                                                <UseAnimations animation={loading3} speed={0} className='dynamic-icon' />
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

                            <TabPanel className='profile-rented-cars-tab' value={valueTab} index='2' hidden={valueTab !== '2'}>
                                <Box className='user-reservations-tab'>
                                    {
                                        rentedCars.length > 0 ? (
                                            <Box className='user-reservations'>
                                                <List className='user-reservations-list'>
                                                    {
                                                        rentedCars.map((rentedCar, index) => (
                                                            <ListItem
                                                                className='user-rented-car'
                                                                key={index}
                                                            >
                                                                <Card>
                                                                    <CardContent className='rented-car-profile'>
                                                                        <Box className='rented-car-images'>
                                                                            <EmblaCarousel images={rentedCar.car.Imagine} />
                                                                        </Box>

                                                                        <Box className='rented-car-details'>
                                                                            <Box className='rented-car-header'>
                                                                                <Typography component='h2' className='rented-car-name'>
                                                                                    {rentedCar.car.Masina}
                                                                                </Typography>
                                                                                <Typography component='h3' className='rented-car-version'>
                                                                                    {rentedCar.car.Versiune}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box className='rented-car-reservation-details'>
                                                                                <Typography component='h3' className='rented-car-start-time'>
                                                                                    {dayjs(rentedCar.startDate).format("DD.MM.YYYY")}
                                                                                </Typography>
                                                                                <Typography component='h3' className='rented-car-time-separator'>
                                                                                    -
                                                                                </Typography>
                                                                                <Typography component='h3' className='rented-car-end-time'>
                                                                                    {dayjs(rentedCar.endDate).format("DD.MM.YYYY")}
                                                                                </Typography>


                                                                                <Box className='rented-car-extend-button'>
                                                                                    <Button
                                                                                        className='extend-button'
                                                                                        onClick={() => extendRentalPeriod(rentedCar)}
                                                                                    >
                                                                                        Extend
                                                                                    </Button>
                                                                                </Box>
                                                                            </Box>

                                                                            <Box className='rented-car-insurance-details'>
                                                                                <Box className='rented-car-insurance'>
                                                                                    {
                                                                                        rentedCar.insurance['thirdPartyLiability'] === true ? (
                                                                                            <CheckCircleIcon className='check-insurance-icon' />
                                                                                        ) : (
                                                                                            <CancelIcon className='cancel-insurance-icon' />
                                                                                        )
                                                                                    }
                                                                                    <Typography className='insurance-type'>Third Party Liability</Typography>
                                                                                </Box>

                                                                                <Box className='rented-car-insurance'>
                                                                                    {
                                                                                        rentedCar.insurance['collisionDamageWaiver'] === true ? (
                                                                                            <CheckCircleIcon className='check-insurance-icon' />
                                                                                        ) : (
                                                                                            <CancelIcon className='cancel-insurance-icon' />
                                                                                        )
                                                                                    }
                                                                                    <Typography className='insurance-type'>Collision Damage Waiver</Typography>
                                                                                </Box>

                                                                                <Box className='rented-car-insurance'>
                                                                                    {
                                                                                        rentedCar.insurance['theftProtection'] === true ? (
                                                                                            <CheckCircleIcon className='check-insurance-icon' />
                                                                                        ) : (
                                                                                            <CancelIcon className='cancel-insurance-icon' />
                                                                                        )
                                                                                    }
                                                                                    <Typography className='insurance-type'>Theft Protection</Typography>
                                                                                </Box>
                                                                            </Box>

                                                                            <Box className='rented-car-footer'>
                                                                                <Box className='rented-car-price'>
                                                                                    <Typography component='h4'>
                                                                                        Rental price: {rentedCar.totalPrice}
                                                                                        <EuroIcon />
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </ListItem>
                                                        ))
                                                    }
                                                </List>
                                            </Box>
                                        ) : (
                                            <Typography className='user-reservations-message'>You have not made any reservations yet!</Typography>
                                        )
                                    }
                                </Box>
                            </TabPanel>
                        </TabContext>
                    </Box>
                ) : (
                    <Box className='results-not-found'>
                        <Error message={error} />
                    </Box>
                )
            }

        </Box>
    );
}

export default Profile;