import './CarDetails.css';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';
import { Box, Button, ListItem, Typography, List, Tooltip, IconButton, Tab, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EmblaCarousel from '../GalleryCarousel/EmblaCarousel';
import EuroIcon from '@mui/icons-material/Euro';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaletteIcon from '@mui/icons-material/Palette';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import InfoIcon from '@mui/icons-material/Info';
import { TbManualGearbox } from "react-icons/tb";
import { MdCo2 } from "react-icons/md";
import { FaCarSide } from "react-icons/fa";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import ErrorComponent from '../Error/Error.jsx';

const todaysDate = dayjs().format('YYYY-MM-DD');

const rentInfoText = `This price is indicative and may vary based on vehicle availability, rental duration, and any additional options selected.
                    The final cost may be adjusted for extra mileage, additional insurance, or optional equipment.`;

function CarDetails() {
    const { auth, cars } = useContext(AppContext);

    const [car, setCar] = useState('');
    const [user, setUser] = useState('');

    const [audioOptions, setAudioOptions] = useState([]);
    const [electronicsOptions, setElectronicsOptions] = useState([]);
    const [optionalsOptions, setOptionalsOptions] = useState([]);
    const [safetyOptions, setSafetyOptions] = useState([]);
    const [performanceOptions, setPerformanceOptions] = useState([]);

    const [minRentalPrice, setMinRentalPrice] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [valueTab, setValueTab] = useState('0');
    const [navigateProfileValueTab, setNavigateProfileValueTab] = useState('0');
    const [open, setOpen] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [alertDialogText, setAlertDialogText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoading(true);
        if (cars.carsStore.getCar()) {
            setCar(cars.carsStore.getCar());
        } else {
            const id = searchParams.get("id") || '';

            if (!id) {
                setError('Car ID not provided!');
                setIsLoading(false);
                return;
            }

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

        if (auth.authStore.getUser()) {
            setUser(auth.authStore.getUser());
        } else {
            const userId = jwtDecode(auth.token).id;
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
                    window.location.reload();
                });
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [auth.token, searchParams]);

    useEffect(() => {
        setIsLoading(true);

        if (car && typeof car === 'object') {
            setAudioOptions(parseOptions(car['Audio si tehnologie']));
            setElectronicsOptions(parseOptions(car['Electronice si sisteme de asistenta']));
            setOptionalsOptions(parseOptions(car['Confort si echipamente optionale']));
            setSafetyOptions(parseOptions(car['Siguranta']));
            setPerformanceOptions(parseOptions(car['Performanta']));

            fetch(`${SERVER}/api/reservations/calculate-rental-price`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cid: car._id,
                    startDate: dayjs(todaysDate).toDate(),
                    endDate: dayjs(todaysDate).toDate(),
                    insuranceOptions: {
                        thirdPartyLiability: false,
                        collisionDamageWaiver: false,
                        theftProtection: false,
                    }
                })
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
                    setMinRentalPrice(parseFloat(Number(data.rentalPrice).toFixed(2)));
                })
                .catch((error) => {
                    console.error(error.message);
                    setMinRentalPrice('-');
                });
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [car]);

    function parseOptions(optionsArray) {
        let optionsComponents = [];
        if (optionsArray) {
            optionsComponents = optionsArray.slice(1, -1).replace(/'/g, '').split(", ");
        }
        return optionsComponents;
    }

    function handleChangeTab(event, newValue) {
        setValueTab(newValue);
    }

    function handleCloseDialog() {
        setOpen(false);
        setError('');
    }

    function handleProfileButton() {
        setOpen(false);

        navigate('/profile', {
            state: {
                valueTab: `${navigateProfileValueTab}`,
            }
        });
    }

    async function rentCar() {
        setOpen(false);
        await fetch(`${SERVER}/api/reservations/check-another-reservation/${user._id}/${car._id}`, {
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
                    })
                }
            })
            .then((data) => {
                setAlertDialogText('');
                const validations = data.validationPassed;
                const messages = data.sendMessages;
                if (validations.validatedDocuments === true && validations.nonexistingReservation === true && validations.underLimit === true) {
                    setAlertDialogText('');
                    setNavigateProfileValueTab('0');
                    navigate('/rent-car?' + new URLSearchParams({ id: car._id, car: car.Masina }).toString(), {
                        state: {
                            from: '/car-details',
                        }
                    });
                } else {
                    if (messages.length > 0) {
                        setAlertDialogText((prevMessage) => {
                            return [...prevMessage, messages.join('\n')];
                        });
                    }
                    if (validations.validatedDocuments === false) {
                        setNavigateProfileValueTab('1');
                        setOpen(true);
                    } else if (validations.nonexistingReservation === false || validations.underLimit === false) {
                        setNavigateProfileValueTab('2');
                        setOpen(true);
                    }
                }
            })
            .catch((error) => {
                console.error(error.message);
                setError(error.message);
            });

    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Box>
            {
                error ? (
                    <Box className='results-not-found'>
                        <ErrorComponent message={error} />
                    </Box>
                ) : car ? (
                    <Box className='car-details-page'>
                        <Box className='car-make-version'>
                            <Typography component='h1' className='car-name'>{car.Masina}</Typography>
                            <Typography component='h2' className='car-version'>{car?.Versiune}</Typography>
                        </Box>
                        <Box className='car-gallery-price'>
                            <Box className='car-gallery'>
                                <EmblaCarousel className='gallery' images={car.Imagine} />
                            </Box>
                            <Box className='car-price'>
                                <Box className='full-price'>
                                    <Typography className='full-price-text'>
                                        Full Price: <EuroIcon className='price-icon' /> {parseFloat(car.Pret.toFixed(2))}
                                    </Typography>
                                </Box>
                                <Box className='rent-price'>
                                    <Box className='rent-container'>
                                        <Typography className='rent-text'>
                                            Rental Price: From
                                            <EuroIcon className='price-icon' />
                                            {minRentalPrice}/day
                                        </Typography>
                                        <Box className='rent-info'>
                                            <Tooltip title={rentInfoText}>
                                                <IconButton>
                                                    <InfoIcon className='info-icon' />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    <Box className='car-rent-button'>
                                        <Button
                                            className='rent-car-button'
                                            onClick={() => {
                                                setOpen(true);
                                                rentCar();
                                            }}>Rent</Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box className='car-features'>
                            <Box className='car-features-title'>
                                <SettingsIcon />
                                <Typography className='specifications-title'>Basics</Typography>
                            </Box>
                            <Box className='car-feature'>
                                <DirectionsCarIcon />
                                <Typography className='car-feature-description'>{car?.Masina} {car?.Versiune} {car?.Generatie} </Typography>
                            </Box>
                            <Box className='car-feature'>
                                <AddRoadIcon />
                                <Typography className='car-feature-description'>{car.KM}</Typography>
                            </Box>
                            {
                                car.Culoare ? (
                                    <Box className='car-feature'>
                                        <PaletteIcon />
                                        <Typography className='car-feature-description'>{car.Culoare} {car['Optiuni culoare']}</Typography>
                                    </Box>
                                ) : null
                            }
                            <Box className='car-feature'>
                                <CalendarMonthIcon />
                                <Typography className='car-feature-description'>{car['Anul productiei']}</Typography>
                            </Box>
                            <Box className='car-feature'>
                                <LocalGasStationIcon />
                                <Typography className='car-feature-description'>{car.Combustibil}</Typography>
                            </Box>
                        </Box>
                        <Box className='car-technical-specifications'>
                            <Box className='car-technical-specifications-title'>
                                <SettingsIcon />
                                <Typography className='specifications-title'>Technical specifications</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <SpeedIcon />
                                <Typography className='car-tehnical-description'>{car['Capacitate cilindrica']} cm3</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <BoltIcon />
                                <Typography className='car-tehnical-description'>{car.Putere} HP</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <FaCarSide />
                                <Typography className='car-tehnical-description'>{car['Tip Caroserie']}</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <TbManualGearbox />
                                <Typography className='car-tehnical-description'>{car['Cutie de viteze']}</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <SettingsIcon />
                                <Typography className='car-tehnical-description'>{car.Transmisie}</Typography>
                            </Box>
                            {
                                car['Emisii CO2'] ? (
                                    <Box className='car-tech-spec'>
                                        <MdCo2 />
                                        <Typography className='car-tehnical-description'>{car['Emisii CO2']} g/km</Typography>
                                    </Box>
                                ) : null
                            }
                            <Box className='car-tech-spec'>
                                <LocalGasStationIcon />
                                <Typography className='car-tehnical-description'>Urban {car['Consum Urban']} l/100km</Typography>
                            </Box>
                            <Box className='car-tech-spec'>
                                <LocalGasStationIcon />
                                <Typography className='car-tehnical-description'>Extraurban {car['Consum Extraurban']} l/100km</Typography>
                            </Box>
                        </Box>
                        {
                            (car['Audio si tehnologie'] || car['Electronice si sisteme de asistenta'] || car['Performanta'] || car['Siguranta'] || car['Confort si echipamente optionale']) ? (
                                <Box className='car-equipments'>
                                    <TabContext value={valueTab}>
                                        <TabList onChange={handleChangeTab} centered>
                                            {
                                                car['Audio si tehnologie'] &&
                                                <Tab label='Audio and technology' value="0" disabled={!car['Audio si tehnologie']}></Tab>
                                            }

                                            {
                                                car['Electronice si sisteme de asistenta'] &&
                                                <Tab label='Electronics and assistance systems' value="1" disabled={!car['Electronice si sisteme de asistenta']}></Tab>
                                            }

                                            {
                                                car['Performanta'] &&
                                                <Tab label='Performance' value="2" disabled={!car['Performanta']}></Tab>
                                            }

                                            {
                                                car['Siguranta'] &&
                                                <Tab label='Safety' value="3" disabled={!car['Siguranta']}></Tab>
                                            }

                                            {
                                                car['Confort si echipamente optionale'] &&
                                                <Tab label='Optionals' value="4" disabled={!car['Confort si echipamente optionale']}></Tab>
                                            }
                                        </TabList>

                                        <TabPanel value="0">
                                            {
                                                audioOptions.length > 0 ? (
                                                    <List className='audio-list'>
                                                        {
                                                            audioOptions.map((element, index) => (
                                                                <ListItem className='car-options' key={index}>{element}</ListItem>
                                                            ))
                                                        }
                                                    </List>
                                                ) : null
                                            }
                                        </TabPanel>
                                        <TabPanel value="1">
                                            {
                                                electronicsOptions.length > 0 ? (
                                                    <List className='electronics-list'>
                                                        {
                                                            electronicsOptions.map((element, index) => (
                                                                <ListItem className='car-options' key={index}>{element}</ListItem>
                                                            ))
                                                        }
                                                    </List>
                                                ) : null
                                            }
                                        </TabPanel>
                                        <TabPanel value="2">
                                            {
                                                performanceOptions.length > 0 ? (
                                                    <List className='performance-list'>
                                                        {
                                                            performanceOptions.map((element, index) => (
                                                                <ListItem className='car-options' key={index}>{element}</ListItem>
                                                            ))
                                                        }
                                                    </List>
                                                ) : null
                                            }
                                        </TabPanel>
                                        <TabPanel value="3">
                                            {
                                                safetyOptions.length > 0 ? (
                                                    <List className='safety-list'>
                                                        {
                                                            safetyOptions.map((element, index) => (
                                                                <ListItem className='car-options' key={index}>{element}</ListItem>
                                                            ))
                                                        }
                                                    </List>
                                                ) : null
                                            }
                                        </TabPanel>
                                        <TabPanel value="4">
                                            {
                                                optionalsOptions.length > 0 ? (
                                                    <List className='optional-list'>
                                                        {
                                                            optionalsOptions.map((element, index) => (
                                                                <ListItem className='car-options' key={index}>{element}</ListItem>
                                                            ))
                                                        }
                                                    </List>
                                                ) : null
                                            }
                                        </TabPanel>
                                    </TabContext>
                                </Box>
                            ) : null
                        }

                        <Dialog
                            fullScreen={fullScreen}
                            open={open}
                            onClose={handleCloseDialog}
                        >
                            <DialogTitle className='rent-reject-title'>
                                {"Something went wrong!"}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText className='rent-reject-content'>
                                    {alertDialogText}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Box className='rent-rejected-buttons'>
                                    <Button className='rent-close-button' onClick={handleCloseDialog} variant='contained'>
                                        Close
                                    </Button>
                                    <Button className='rent-rejected-button' onClick={handleProfileButton} variant='contained'>
                                        Profile
                                    </Button>
                                </Box>
                            </DialogActions>
                        </Dialog>
                    </Box>
                ) : null
            }
        </Box>
    );
}

export default CarDetails;