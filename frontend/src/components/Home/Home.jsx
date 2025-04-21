import './Home.css';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';
import '../Search/Search.jsx';
import { Box, Button, CardMedia, Typography } from '@mui/material';
import photo from '../../assets/home_main_photo.jpg';
import { jwtDecode } from 'jwt-decode';
import { SERVER } from '../../config/global.jsx';
import AdminDashboard from '../AdminDashboard/AdminDashboard.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function Home() {
    const { auth } = useContext(AppContext);

    const [isLoading, setIsLoading] = useState(true);

    const [token, setToken] = useState('');
    const [user, setUser] = useState('');

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

    function redirectToRegister() {
        navigate('/register');
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Box className='home-page'>
            {
                token ? (
                    <Box>
                        <Box className='home-page-regular'>
                            <Box className='home-left-page'>
                                <Box className='home-section-title'>
                                    <Typography className='home-title'>Search for a specific car</Typography>
                                </Box>
                                <Box className='home-section-description'>
                                    <Typography className='home-connected-description'>
                                        Search for the best rental offer for your dream car.
                                    </Typography>
                                    <Typography className='home-bullets'>
                                        <CheckCircleIcon color='success' className='check-icon' />Choose from thousands of cars <br />
                                        <CheckCircleIcon color='success' className='check-icon' />Filter by brand, model, price or bodytype <br />
                                        <CheckCircleIcon color='success' className='check-icon' />Instant availability <br />
                                    </Typography>
                                </Box>
                                <Box className='home-redirect-button'>
                                    <Button
                                        variant='contained'
                                        onClick={() => {
                                            navigate('/search');
                                        }}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </Box>

                            <Box className='home-right-page'>
                                <Box className='home-section-title'>
                                    <Typography className='home-title'>Recommendation Form</Typography>
                                </Box>
                                <Box className='home-section-description'>
                                    <Typography className='home-connected-description'>
                                        Fill out the form in just a minute to find out which car suits you.
                                    </Typography>
                                    <Typography className='home-bullets'>
                                        <CheckCircleIcon color='success' className='check-icon' />Less than 1 minute to answer<br />
                                        <CheckCircleIcon color='success' className='check-icon' />Personalized car based on your preferences and lifestyle<br />
                                        <CheckCircleIcon color='success' className='check-icon' />Stop wasting your time <br />
                                    </Typography>
                                </Box>
                                <Box className='home-redirect-button'>
                                    <Button
                                        variant='contained'
                                        onClick={() => {
                                            navigate('/form');
                                        }}
                                    >
                                        Form
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {
                                user.status === 'regular' ? null : (
                                    <Box className='home-dashboard'>
                                        <Box className='home-dashboard-section'>
                                            <Typography className='home-title'>Admin Dashboard</Typography>
                                        </Box>

                                        <Box className='home-dashboard-button'>
                                            <Button
                                                variant='contained'
                                                onClick={() => {
                                                    navigate('/dashboard');
                                                }}
                                            >
                                                Dashboard
                                            </Button>
                                        </Box>
                                    </Box>
                                )
                            }
                    </Box>
                ) : (
                    <Box className='home-landing-page'>
                        <Box className='home-hero'>
                            <Box className='home-motto'>
                                <Typography component='h1'>The Smart Way To Find The Perfect Car</Typography>
                            </Box>
                            <Box className='home-description'>
                                <Typography component='h1'>CarMinds helps you discover the perfect car for your lifestyle, whether you need a short-term rental,
                                    a flexible subscription or a test drive before buying. Sign up now and enjoy exclusive benefits absolutely free!</Typography>
                                <Button
                                    className='home-register-button'
                                    onClick={redirectToRegister}
                                >Sign up</Button>
                            </Box>
                        </Box>
                        <Box className='home-main'>
                            <CardMedia
                                className='home-main-photo'
                                component='img'
                                srcSet={photo}
                                alt='Car landing page photo'
                            />
                            <Box className='home-main-text'>
                                <Box className='home-header'>
                                    <Typography className='home-header-text'>Start your journey with the perfect car!</Typography>
                                </Box>
                                <Box className='home-subtitle'>
                                    <Typography className='home-subtitle-text'>Join CarMinds today and get free access to personalized car recommendations, special rental offers and seamless booking -
                                        all designed to make your driving experience effortless!
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )
            }
        </Box>
    );
}

export default Home;