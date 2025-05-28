import './Home.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../../state/AppContext';
import { data, useNavigate } from 'react-router-dom';
import '../Search/Search.jsx';
import { Box, Button, CardMedia, Typography, FormControl, InputLabel, Input, IconButton, Tooltip, Card, CardActionArea, CardContent } from '@mui/material';
import photo from '../../assets/landing_page_background.png';
import { jwtDecode } from 'jwt-decode';
import { SERVER } from '../../config/global.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EmergencyIcon from '@mui/icons-material/Emergency';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CarRentalIcon from '@mui/icons-material/CarRental';
import searchPhoto from '../../assets/search_home_image.jpg';
import formPhoto from '../../assets/home_image_form.jpg';
import EmblaCarousel from '../GalleryCarousel/EmblaCarousel.jsx';

const fillTheFormAsterisk = 'Already know what you want? Search directly for the desired model!';

function Home() {
    const { auth } = useContext(AppContext);
    const heroSectionRef = useRef(null);
    const howItWorksSectionRef = useRef(null);
    const whyToChooseUsRef = useRef(null);
    const recommendationsRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);

    const [token, setToken] = useState('');
    const [user, setUser] = useState('');

    const [email, setEmail] = useState('');

    const [recommendations, setRecommendations] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        setToken(auth.token);
        setIsLoading(true);

        if (auth.authStore.getUser()) {
            setUser(auth.authStore.getUser());
        } else if (auth.authStore.token) {
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
                    }
                })
                .then((data) => {
                    setUser(data.user);
                })
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [auth.token]);

    useEffect(() => {
        if (user.cluster) {
            fetch(`${SERVER}/api/users/quick-recommendations`, {
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
                    setRecommendations(data.recommendations);
                })
        }
    }, [user]);

    function redirectToRegister() {
        navigate('/register', {
            state: {
                email: email,
            }
        });
    }

    function redirectToDashboard() {
        if (user.status === 'admin') {
            navigate('/dashboard');
        }
    }

    function scrollToNextSection(ref) {
        console.log(ref.current);
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }

    function redirectToSelectedCar(car) {
        navigate(`/car-details?id=${car._id}`);
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Box className='home-page'>
            {
                token ? (
                    <Box className='home-page-authenticated' ref={heroSectionRef}>
                        <Box className='home-page-welcome'>
                            <Typography className='home-page-welcome-text'>Welcome back, {user.firstname} {user.lastname}!</Typography>
                            <Typography className='home-page-subtitle'>Looking for your next car? Take a look at your posibilities</Typography>
                        </Box>

                        <Box className='home-page-authenticated-content'>
                            <Card className='home-page-card'>
                                <CardActionArea
                                    onClick={() => navigate('/search')}
                                >
                                    <CardMedia
                                        component='img'
                                        height='140'
                                        alt='search image'
                                        src={searchPhoto}
                                        className='home-card-photo'
                                    />
                                    <CardContent className='home-card-content'>
                                        <Typography className='home-card-title'>Search</Typography>
                                        <Typography className='home-card-subtitle'>Look for the desired car by make, model, bodytype and price</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>

                            <Card className='home-page-card'>
                                <CardActionArea
                                    onClick={() => navigate('/form')}
                                >
                                    <CardMedia
                                        component='img'
                                        height='140'
                                        alt='search image'
                                        src={formPhoto}
                                        className='home-card-photo'
                                    />
                                    <CardContent className='home-card-content'>
                                        <Typography className='home-card-title'>Form</Typography>
                                        <Typography className='home-card-subtitle'>Fill out the form that will recommend the right car for your personality and behavior</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Box>

                        {
                            user.status === 'admin' ? (
                                <Box className='admin-dashboard'>
                                    <Typography className='admin-dashboard-title'>Admin Dashboard</Typography>
                                    <Button
                                        className='admin-dashboard-button'
                                        variant='contained'
                                        onClick={redirectToDashboard}
                                    >
                                        Dashboard
                                    </Button>
                                </Box>
                            ) : null
                        }

                        <Box className='home-next-section button-section1'>
                            <IconButton
                                className='next-section-button'
                                onClick={() => scrollToNextSection(howItWorksSectionRef)}
                            >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <Box className='home-landing-page' ref={heroSectionRef}>
                        <Box className='home-hero-section'>
                            <Box className='home-motto'>
                                <Box className='home-car'>
                                    <Box
                                        className='home-car-photo'
                                        component='img'
                                        src={photo}
                                        alt='Car for landing page'
                                    />
                                </Box>
                                <Box className='home-header'>
                                    <Box className='home-title'>
                                        <Typography className='home-title-text'>The Smart Way To Find Your Perfect Car</Typography>
                                    </Box>
                                    <Box className='home-subtitle'>
                                        <Typography className='home-subtitle-text'>The perfect car is not a myth! We choose it for you based on your needs and preferences!</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box className='home-redirect-register'>
                                <Box className='home-register'>
                                    <Typography className='home-register-text'>Sign up right now to benefit from our services</Typography>
                                </Box>
                                <Box className='home-register-input'>
                                    <Box className='home-register-input-email'>
                                        <FormControl className='login-input'>
                                            <InputLabel htmlFor='email-input' className='login-label'>Email</InputLabel>
                                            <Input
                                                id='email-input'
                                                label='Email'
                                                type='text'
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            >
                                            </Input>
                                        </FormControl>
                                    </Box>
                                    <Box className='home-register-redirect-button'>
                                        <Button
                                            className='home-register-button'
                                            onClick={redirectToRegister}
                                        >
                                            Sign up
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box className='home-next-section button-section1'>
                            <IconButton
                                className='next-section-button'
                                onClick={() => scrollToNextSection(howItWorksSectionRef)}
                            >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>
                    </Box>
                )
            }

            {
                user.cluster ? (
                    <Box className='recommendations-section' ref={recommendationsRef}>
                        <Box className='recommendations-title'>
                            <Box className='recommendations-header'>
                                <Typography className='recommendations-header-text'>You might love these</Typography>
                            </Box>
                            <Box className='recommendations-subtitle'>
                                <Typography className='recommendations-subtitle-text'>Next stops on your journey</Typography>
                            </Box>
                        </Box>

                        <Box className='recommendations-grid'>
                            {
                                recommendations.map((car, index) => (
                                    <Card className='recommendation-card' key={index}>
                                        <CardContent className='recommendation-content'>
                                            <Box className='car-images'>
                                                <EmblaCarousel className='home-gallery' images={car.Imagine} />
                                            </Box>
                                            <Typography className='recommendation-car-name'>{car.Masina}</Typography>
                                            <Box className='recommendation-car-details'>
                                                <Typography className='recommendation-car-detail'>{car.Combustibil}</Typography>
                                                <Typography className='recommendation-car-detail'>{car["Anul productiei"]}</Typography>
                                                <Typography className='recommendation-car-detail'>{car["Tip Caroserie"]}</Typography>
                                            </Box>
                                        </CardContent>

                                        <Box className='recommendations-redirect'>
                                            <Button
                                                className='recommendations-redirect-button'
                                                onClick={() => redirectToSelectedCar(car)}
                                                variant='contained'
                                            >Select</Button>
                                        </Box>
                                    </Card>
                                ))
                            }
                        </Box>

                        <Box className='home-next-section'>
                            <IconButton
                                className='next-section-button'
                                onClick={() => scrollToNextSection(howItWorksSectionRef)}
                            >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ) : null
            }

            <Box className='home-how-it-works-section' ref={howItWorksSectionRef}>
                <Box className='home-how-it-works-title'>
                    <Box className='home-how-it-works-header'>
                        <Typography className='home-how-it-works-header-text'>How it works</Typography>
                    </Box>
                    <Box className='home-how-it-works-subtitle'>
                        <Typography className='home-how-it-works-subtitle-text'>Discover the perfect car in just 3 steps</Typography>
                    </Box>
                </Box>

                <Box className='home-how-it-works-steps'>
                    <Box className='home-how-it-works-step'>
                        <EditNoteIcon className='home-step-icon' />
                        <Box className='home-step-description'>
                            <Box className='home-step-title-asterisk'>
                                <Typography className='home-step-title'>Fill in the form</Typography>
                                <Tooltip className='home-step-asterisk' title={fillTheFormAsterisk}>
                                    <IconButton>
                                        <EmergencyIcon className='asterisk' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography className='home-step-subtitle'>Answer questions to find the car for your needs </Typography>

                        </Box>
                    </Box>

                    <Box className='home-how-it-works-step'>
                        <SearchIcon className='home-step-icon' />
                        <Box className='home-step-description'>
                            <Typography className='home-step-title'>Choose the right car</Typography>
                            <Typography className='home-step-subtitle'>Select your favourite model from those available</Typography>
                        </Box>
                    </Box>

                    <Box className='home-how-it-works-step'>
                        <DirectionsCarIcon className='home-step-icon' />
                        <Box className='home-step-description'>
                            <Typography className='home-step-title'>Book the car</Typography>
                            <Typography className='home-step-subtitle'>Fill in the required details to enjoy the car</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box className='home-next-section'>
                    <IconButton
                        className='next-section-button button-section2'
                        onClick={() => scrollToNextSection(whyToChooseUsRef)}
                    >
                        <KeyboardArrowDownIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box className='home-why-to-choose-us-section' ref={whyToChooseUsRef}>
                <Box className='home-why-to-choose-us-title'>
                    <Box className='home-why-to-choose-us-header'>
                        <Typography className='home-why-to-choose-us-header-text'>Why to choose us</Typography>
                    </Box>
                    <Box className='home-why-to-choose-us-subtitle'>
                        <Typography className='home-why-to-choose-us-subtitle-text'>Unlock the reasons our product is perfect for your needs</Typography>
                    </Box>
                </Box>

                <Box className='home-why-to-choose-us-content'>
                    <Box className='home-why-to-choose-us-reason'>
                        <PsychologyIcon className='home-step-icon' />
                        <Box className='home-reason'>
                            <Typography className='home-reason-title'>AI integration</Typography>
                            <Typography className='home-reason-subtitle'>Powered by AI, our smart form finds the perfect match for you.</Typography>
                        </Box>
                    </Box>
                    <Box className='home-why-to-choose-us-reason'>
                        <LaptopChromebookIcon className='home-step-icon' />
                        <Box className='home-reason'>
                            <Typography className='home-reason-title'>Just 1 click away</Typography>
                            <Typography className='home-reason-subtitle'>Simplifying your search, accelerating your journey.</Typography>
                        </Box>
                    </Box>
                    <Box className='home-why-to-choose-us-reason'>
                        <SupportAgentIcon className='home-step-icon' />
                        <Box className='home-reason'>
                            <Typography className='home-reason-title'>24/7 technical suport</Typography>
                            <Typography className='home-reason-subtitle'>Whatever the issue, we've got your back. Our support agents are here to help you.</Typography>
                        </Box>
                    </Box>
                    <Box className='home-why-to-choose-us-reason'>
                        <CarRentalIcon className='home-step-icon' />
                        <Box className='home-reason'>
                            <Typography className='home-reason-title'>Flexibility</Typography>
                            <Typography className='home-reason-subtitle'>Your rental, your rules. From duration to insurances.</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Home;