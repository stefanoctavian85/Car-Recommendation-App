import './RentCar.css';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Step, StepLabel, Stepper, Typography, FormControl, InputLabel, Input, InputAdornment } from '@mui/material';
import AppContext from '../../state/AppContext';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ErrorIcon from '@mui/icons-material/Error';
import PaletteIcon from '@mui/icons-material/Palette';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import dayjs from 'dayjs';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../PaymentForm/PaymentForm.jsx';
import ErrorComponent from '../Error/Error.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const appearence = {
    labels: 'floating'
}

const steps = ['Select rental details', 'Complete the final documents', 'Payment'];

const currentDate = dayjs();

function RentCar() {
    const { auth, cars } = useContext(AppContext);
    const [car, setCar] = useState('');
    const [user, setUser] = useState('');

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('');
    const [insuranceOptions, setInsuranceOptions] = useState({
        thirdPartyLiability: false,
        collisionDamageWaiver: false,
        theftProtection: false,
    });

    const [reservationsDates, setReservationsDates] = useState([]);
    const [disabledDates, setDisabledDates] = useState([]);
    const [reservationErrorMessage, setReservationErrorMessage] = useState('');
    const [disableStartDate, setDisableStartDate] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [phoneNumberTouched, setPhoneNumberTouched] = useState('');
    const [phoneNumberMessage, setPhoneNumberMessage] = useState('');

    const [isFullInsuranceChecked, setIsFullInsuranceChecked] = useState(false);
    const [isIndeterminate, setIsIndeterminate] = useState(false);

    const [activeStep, setActiveStep] = useState(0);

    const [rentalPrice, setRentalPrice] = useState(0);
    const [rentalPriceErrorMessage, setRentalPriceErrorMessage] = useState('');

    const [clientSecret, setClientSecret] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);

        if (location.state?.from === '/profile') {
            if (cars.carsStore.getCar()) {
                setCar(cars.carsStore.getCar());
                setStartDate(dayjs(cars.carsStore.getReservation().endDate).add(1, 'day'));
                setDisableStartDate(true);
                setInsuranceOptions(cars.carsStore.getReservation().insurance);
            } else {
                navigate('/profile', {
                    state: {
                        valueTab: '2',
                    }
                });
            }
        } else if (location.state?.from === '/car-details') {
            if (cars.carsStore.getCar()) {
                setCar(cars.carsStore.getCar());
            } else {
                const id = searchParams.get("id") || '';
                fetch(`${SERVER}/api/car?id=${id}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                    }
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        } else {
                            return res.json().then((error) => {
                                throw new Error(error.message || 'Something went wrong!');
                            })
                        }
                    })
                    .then((data) => {
                        setCar(data.car);
                        cars.carsStore.setCar(data.car);
                    })
                    .catch((error) => {
                        console.error(error.message);
                        setError(error.message);
                        setCar('');
                    });
            }
        } else {
            navigate('/');
        }

        if (auth.authStore.getUser()) {
            setUser(auth.authStore.getUser());
        } else {
            const userId = jwtDecode(auth.authStore.token).id;
            fetch(`${SERVER}/api/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.json().then((error) => {
                            throw new Error(error.message || 'Something went wrong!');
                        });
                    }
                })
                .then((data) => {
                    setUser(data.user);
                    auth.authStore.setUser(data.user);
                })
                .catch((error) => {
                    console.error(error.message);
                    setUser('');
                    auth.authStore.logout();
                    auth.setIsAuthenticated(false);
                    setError(error.message);
                });
        }

        setIsFullInsuranceChecked(insuranceOptions.thirdPartyLiability && insuranceOptions.collisionDamageWaiver && insuranceOptions.theftProtection);
        setIsIndeterminate(!isFullInsuranceChecked && (insuranceOptions.thirdPartyLiability || insuranceOptions.collisionDamageWaiver || insuranceOptions.theftProtection));

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [auth.token, searchParams]);

    useEffect(() => {
        setIsLoading(true);

        if (car) {
            fetch(`${SERVER}/api/reservations/${car._id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.json().then((error) => {
                            throw new Error(error.message || "Something went wrong!");
                        });
                    }
                })
                .then((data) => {
                    setReservationsDates(data.reservationDates);

                    const disabledDates = []
                    data.reservationDates.forEach((date) => {
                        const start = dayjs(date.startDate);
                        const end = dayjs(date.endDate).add(1, 'day');
                        let current = start;

                        while (current.isBefore(end) || current.isSame(start)) {
                            disabledDates.push(current.format('YYYY-MM-DD'));
                            current = current.add(1, 'day');
                        }
                    });

                    setDisabledDates(disabledDates);
                })
                .catch((error) => {
                    console.error(error.message);
                    setDisabledDates([]);
                });
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [car, auth.token]);

    useEffect(() => {
        const allChecked = insuranceOptions.thirdPartyLiability && insuranceOptions.collisionDamageWaiver
            && insuranceOptions.theftProtection;
        setIsFullInsuranceChecked(allChecked);
        setIsIndeterminate(!allChecked && (insuranceOptions.thirdPartyLiability || insuranceOptions.collisionDamageWaiver || insuranceOptions.theftProtection));

    }, [insuranceOptions]);

    function handleBackStep() {
        if (activeStep === 0) {
            navigate(`/car-details?id=${car._id}`);
        } else if (activeStep > 0) {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    }

    async function handleNextStep() {
        if (activeStep === 0) {
            if (!startDate || !endDate) {
                setReservationErrorMessage('You must select the rental period!');
                return;
            } else if (dayjs(startDate).isAfter(endDate) || dayjs(endDate).isBefore(startDate) || endDate === '') {
                setReservationErrorMessage('You cannot select the end date before the start date or the start date after the end date!');
                return;
            } else {
                setIsLoading(true);
                setReservationErrorMessage('');
                try {
                    const response = await fetch(`${SERVER}/api/reservations/check-availability`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${auth.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cid: car._id,
                            startDate,
                            endDate
                        })
                    });

                    const data = await response.json();
                    if (response.ok && data.available) {
                        setReservationErrorMessage('');
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    } else {
                        setReservationErrorMessage(data.message || 'Car is not available for the selected date!');
                    }
                } catch (error) {
                    console.error(error.message);
                    setError(error.message);
                }

                let price = 0;
                try {
                    const res = await fetch(`${SERVER}/api/reservations/calculate-rental-price`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${auth.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            cid: car._id,
                            startDate,
                            endDate,
                            insuranceOptions
                        })
                    });

                    const dataPrice = await res.json();
                    if (res.ok) {
                        price = dataPrice.rentalPrice;
                        setRentalPrice(dataPrice.rentalPrice);
                        setRentalPriceErrorMessage('');
                    } else {
                        setRentalPriceErrorMessage(dataPrice.message);
                    }
                } catch (error) {
                    console.error(error.message);
                    setError(error.message);
                }

                fetch(`${SERVER}/api/reservations/create-payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en',
                    },
                    body: JSON.stringify({
                        carId: car._id,
                        rentalPrice: price,
                        insuranceOptions,
                        nrDays: dayjs(endDate).diff(dayjs(startDate), 'day') + 1,
                    }),
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        } else {
                            return res.json().then((error) => {
                                throw new Error(error.message || 'Processing payment failed!')
                            })
                        }
                    })
                    .then((data) => {
                        setClientSecret(data.clientSecret);
                    })
                    .catch((error) => {
                        console.error(error.message);
                        setError(error.message);
                    });
            }
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
            return () => clearTimeout(timeout);
        }

        if (activeStep === 1) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }

        if (activeStep === 2) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
        try {
            const response = await fetch(`${SERVER}/api/users/save-phone-number`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user._id, phoneNumber })
            });

            const data = await response.json();
            if (response.ok) {
                setPhoneNumberMessage(data.message);
            } else {
                setPhoneNumberError(data.message || "Phone number couldn't be saved!")
            }
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    }

    function handleInsuranceOptionsChange(event) {
        const { name, checked } = event.target;

        if (name === "fullInsurance") {
            setInsuranceOptions({
                thirdPartyLiability: checked,
                collisionDamageWaiver: checked,
                theftProtection: checked,
            });
        } else {
            setInsuranceOptions((prevOptions) => {
                const newOptions = { ...prevOptions, [name]: checked };

                return newOptions;
            })
        }
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        user && car ? (
            <Box className='rent-car-page'>
                <Stepper activeStep={activeStep} className='rent-car-steps'>
                    {
                        steps.map((step, index) => (
                            <Step key={index}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))
                    }
                </Stepper>
                <Fragment>
                    <Box className='steppers-container'>
                        {
                            activeStep === 0 ? (
                                <Box className='rental-period'>
                                    <Box className='rented-car'>
                                        <Typography component='h1' className='car-name-rental'>{car.Masina}</Typography>
                                        <Typography component='h2' className='car-version-rental'>{car?.Versiune}</Typography>
                                    </Box>

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateRangePicker']}>
                                            <DemoItem component="DateRangePicker">
                                                <Box className='date-pickers'>
                                                    <DatePicker
                                                        className='date-picker'
                                                        label='Start date'
                                                        disabled={disableStartDate}
                                                        minDate={currentDate}
                                                        value={startDate !== '' ? dayjs(startDate) : null}
                                                        onChange={(date) => setStartDate(date)}
                                                        shouldDisableDate={(date) => disabledDates.includes(date.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            field: {
                                                                clearable: true,
                                                                onClear: () => setStartDate('')
                                                            }
                                                        }}
                                                    />
                                                    <Typography className='date-picker-separator'>-</Typography>
                                                    <DatePicker
                                                        className='date-picker'
                                                        label='End date'
                                                        minDate={disableStartDate === true ? startDate : currentDate}
                                                        value={endDate !== '' ? dayjs(endDate) : null}
                                                        onChange={(date) => setEndDate(date)}
                                                        shouldDisableDate={(date) => disabledDates.includes(date.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            field: {
                                                                clearable: true,
                                                                onClear: () => setEndDate('')
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>

                                    <Box className='rental-additional-options'>
                                        <Box className='rental-insurances'>
                                            <Typography component='h2' className='car-insurance'>Car Insurances</Typography>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label='Full insurance'
                                                    name='fullInsurance'
                                                    className='car-insurance-option'
                                                    control={
                                                        <Checkbox
                                                            checked={isFullInsuranceChecked}
                                                            indeterminate={isIndeterminate}
                                                            onChange={handleInsuranceOptionsChange}
                                                        />
                                                    }
                                                />
                                                <FormControlLabel
                                                    className='car-insurance-option'
                                                    control={<Checkbox
                                                        checked={insuranceOptions?.thirdPartyLiability}
                                                        onChange={handleInsuranceOptionsChange}
                                                        name='thirdPartyLiability'
                                                    />}
                                                    label='Third Party Liability'
                                                />
                                                <FormControlLabel
                                                    className='car-insurance-option'
                                                    control={<Checkbox
                                                        checked={insuranceOptions?.collisionDamageWaiver}
                                                        onChange={handleInsuranceOptionsChange}
                                                        name='collisionDamageWaiver'
                                                    />}
                                                    label='Collision Damage Waiver'
                                                />
                                                <FormControlLabel
                                                    className='car-insurance-option'
                                                    control={
                                                        <Checkbox
                                                            checked={insuranceOptions?.theftProtection}
                                                            onChange={handleInsuranceOptionsChange}
                                                            name='theftProtection'
                                                        />}
                                                    label='Theft Protection'
                                                />
                                            </FormGroup>
                                        </Box>
                                    </Box>

                                    <Box className='rental-period-error'>
                                        <Typography className='rental-period-error-message'>{reservationErrorMessage}</Typography>
                                    </Box>
                                </Box>
                            ) : null
                        }

                        {
                            activeStep === 1 ? (
                                <Box className='rental-details'>
                                    <Box className='rental-details-title'>
                                        <AssignmentIcon />
                                        <Typography className='rental-details-title-text' component='h1'>Here are the details of the rental agreement!</Typography>
                                    </Box>

                                    <Box className='rental-details-account-car'>
                                        <Box className='rental-details-account'>
                                            <Typography component='h2' className='rental-details-account-title'>Reservation details</Typography>

                                            <Box className='user-info'>
                                                <PersonIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{user.firstname} {user.lastname}</Typography>
                                            </Box>

                                            <Box className='user-info'>
                                                <AlternateEmailIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{user.email}</Typography>
                                            </Box>

                                            <Box className='user-info'>
                                                <LocalPhoneIcon className='profile-icon phone-icon' />
                                                {
                                                    user.phoneNumber ? (
                                                        <Box className='user-valid-phonenumber'>
                                                            <Typography className='user-info-detail'>{user.phoneNumber}</Typography>
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
                                                                <Typography className='save-phone-number-message-text'>{phoneNumberMessage}</Typography>
                                                            </Box>
                                                        </Box>
                                                    )
                                                }
                                            </Box>

                                            <Box className='user-info'>
                                                <CalendarMonthIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{startDate.format('MM/DD')} - {endDate.format('MM/DD/YYYY')}</Typography>
                                            </Box>
                                        </Box>

                                        <Box className='rental-details-car'>
                                            <Typography component='h2' className='rental-details-car-title'>Car details</Typography>

                                            <Box className='rented-car'>
                                                <Typography component='h1' className='car-name'>{car.Masina}</Typography>
                                                <Typography component='h2' className='car-version'>{car?.Versiune}</Typography>
                                            </Box>

                                            <Box className='rented-car-feature'>
                                                <AddRoadIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{car.KM}</Typography>
                                            </Box>
                                            {
                                                car.Culoare ? (
                                                    <Box className='rented-car-feature'>
                                                        <PaletteIcon className='profile-icon' />
                                                        <Typography className='user-info-detail'>{car.Culoare} {car['Optiuni culoare']}</Typography>
                                                    </Box>
                                                ) : null
                                            }
                                            <Box className='rented-car-feature'>
                                                <CalendarMonthIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{car['Anul productiei']}</Typography>
                                            </Box>
                                            <Box className='rented-car-feature'>
                                                <LocalGasStationIcon className='profile-icon' />
                                                <Typography className='user-info-detail'>{car.Combustibil}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box className='rental-price'>
                                        <Typography component='h2' className='rental-price-text'>Rental price: {rentalPrice} EUR</Typography>
                                        <Typography className='rental-period-error-message'>{rentalPriceErrorMessage}</Typography>
                                    </Box>
                                </Box>
                            ) : null
                        }

                        {
                            activeStep === 2 ? (
                                <Box className='payment-section'>
                                    <Box className='payment-section-header'>
                                        <Typography className='payment-title'>Payment</Typography>
                                        <Typography className='payment-subtitle'>Rental Price: {rentalPrice} EUR</Typography>
                                    </Box>
                                    <Box className='payment-content'>
                                        <Elements stripe={stripePromise} options={{
                                            clientSecret: clientSecret,
                                            locale: 'en',
                                            appearance: appearence,
                                        }}>
                                            {
                                                clientSecret && <PaymentForm
                                                    car={car}
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    insuranceOptions={insuranceOptions}
                                                    rentalPrice={rentalPrice}
                                                />
                                            }
                                        </Elements>
                                    </Box>
                                </Box>
                            ) : null
                        }
                    </Box>

                    <Box className='rent-buttons'>
                        <Button onClick={handleBackStep} className='back-button'>Back</Button>
                        {
                            activeStep !== 2 ? (
                                <Button onClick={handleNextStep} className='next-stepper-button'>
                                    {
                                        activeStep < 2 ? 'Next' :
                                            activeStep === 2 ? 'Pay' : 'See your rented cars now!'
                                    }
                                </Button>
                            ) : null
                        }

                    </Box>
                </Fragment>
            </Box>
        ) : (
            <Box className='results-not-found'>
                <ErrorComponent message={error} />
            </Box>
        )
    );
}

export default RentCar;