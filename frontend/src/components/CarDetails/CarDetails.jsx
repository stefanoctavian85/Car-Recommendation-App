import './CarDetails.css';
import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global.jsx';
import { Box, Button, ListItem, Typography, List, Tooltip, IconButton, Tab } from '@mui/material';
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import CableIcon from '@mui/icons-material/Cable';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import InfoIcon from '@mui/icons-material/Info';
import { TbManualGearbox } from "react-icons/tb";
import { MdCo2 } from "react-icons/md";
import { FaCarSide } from "react-icons/fa";


function CarDetails() {
    const { auth, cars } = useContext(AppContext);
    const [car, setCar] = useState('');
    const [audioOptions, setAudioOptions] = useState([]);
    const [electronicsOptions, setElectronicsOptions] = useState([]);
    const [optionalsOptions, setOptionalsOptions] = useState([]);
    const [safetyOptions, setSafetyOptions] = useState([]);
    const [performanceOptions, setPerformanceOptions] = useState([]);

    const [valueTab, setValueTab] = useState('0');

    const [searchParams] = useSearchParams();

    const rentInfoText = `This price is indicative and may vary based on vehicle availability, rental duration, and any additional options selected. The final cost may be adjusted for
                        extra mileage, additional insurance, or optional equipment.`;

    useEffect(() => {
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
                    }
                })
                .then((data) => {
                    setCar(data.car);
                    cars.carsStore.setCar(data.car);
                    setAudioOptions(parseOptions(data.car['Audio si tehnologie']));
                    setElectronicsOptions(parseOptions(data.car['Electronice si sisteme de asistenta']));
                    setOptionalsOptions(parseOptions(data.car['Confort si echipamente optionale']));
                    setSafetyOptions(parseOptions(data.car['Siguranta']));
                    setPerformanceOptions(parseOptions(data.car['Performanta']));
                });
        }
    }, [car, audioOptions, electronicsOptions, optionalsOptions, safetyOptions, performanceOptions]);

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

    return (
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
                    <Box className='buy-now'>
                        <Typography className='buy-now-text'>
                            Buy Now: <EuroIcon className='price-icon' /> {car.Pret}
                        </Typography>
                        <Box className='car-buy-now-button'>
                            <Button>Buy Now</Button>
                        </Box>
                    </Box>
                    <Box className='rent-price'>
                        <Box className='rent-container'>
                            <Typography className='rent-text'>
                                Rental Price: From
                                <EuroIcon className='price-icon' />
                                X/day
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
                            <Button>Rent</Button>
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
                    <Typography>{car?.Masina} {car?.Versiune} {car?.Generatie} </Typography>
                </Box>
                <Box className='car-feature'>
                    <AddRoadIcon />
                    <Typography>{car.KM}</Typography>
                </Box>
                {
                    car.Culoare ? (
                        <Box className='car-feature'>
                            <PaletteIcon />
                            <Typography className='car-feature-color'>{car.Culoare} {car['Optiuni culoare']}</Typography>
                        </Box>
                    ) : null
                }
                <Box className='car-feature'>
                    <CalendarMonthIcon />
                    <Typography>{car['Anul productiei']}</Typography>
                </Box>
                <Box className='car-feature'>
                    <LocalGasStationIcon />
                    <Typography>{car.Combustibil}</Typography>
                </Box>
            </Box>
            <Box className='car-technical-specifications'>
                <Box className='car-technical-specifications-title'>
                    <SettingsIcon />
                    <Typography className='specifications-title'>Technical specifications</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <SpeedIcon />
                    <Typography>{car['Capacitate cilindrica']} cm3</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <BoltIcon />
                    <Typography>{car.Putere} HP</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <FaCarSide />
                    <Typography>{car['Tip Caroserie']}</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <TbManualGearbox />
                    <Typography>{car['Cutie de viteze']}</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <SettingsIcon />
                    <Typography>{car.Transmisie}</Typography>
                </Box>
                {
                    car['Emisii CO2'] ? (
                        <Box className='car-tech-spec'>
                            <MdCo2 />
                            <Typography>{car['Emisii CO2']} g/km</Typography>
                        </Box>
                    ) : null
                }
                <Box className='car-tech-spec'>
                    <LocalGasStationIcon />
                    <Typography>Urban {car['Consum Urban']} l/100km</Typography>
                </Box>
                <Box className='car-tech-spec'>
                    <LocalGasStationIcon />
                    <Typography>Extraurban {car['Consum Extraurban']} l/100km</Typography>
                </Box>
            </Box>
            <Box className='car-equipments'>
                <TabContext value={valueTab}>
                    <TabList onChange={handleChangeTab} centered>
                        <Tab label='Audio and technology' value="0"></Tab>
                        <Tab label='Electronics and assistance systems' value="1"></Tab>
                        <Tab label='Performance' value="2"></Tab>
                        <Tab label='Safety' value="3"></Tab>
                        <Tab label='Optionals' value="4"></Tab>
                    </TabList>

                    <TabPanel value="0">
                        {
                            car['Audio si tehnologie'] ? (

                                <Box className='car-audio-options'>
                                    {
                                        audioOptions.length > 0 ? (
                                            <List className='audio-list'>
                                                {
                                                    audioOptions.map((element, index) => (
                                                        <ListItem key={index}>{element}</ListItem>
                                                    ))
                                                }
                                            </List>
                                        ) : null
                                    }
                                </Box>
                            ) : null
                        }
                    </TabPanel>
                    <TabPanel value="1">
                        {
                            electronicsOptions.length > 0 ? (
                                <List className='electronics-list'>
                                    {
                                        electronicsOptions.map((element, index) => (
                                            <ListItem key={index}>{element}</ListItem>
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
                                            <ListItem key={index}>{element}</ListItem>
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
                                            <ListItem key={index}>{element}</ListItem>
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
                                            <ListItem key={index}>{element}</ListItem>
                                        ))
                                    }
                                </List>
                            ) : null
                        }
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    );
}

export default CarDetails;