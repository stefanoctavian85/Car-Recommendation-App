import './Home.css';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';
import '../Search/Search.jsx';
import Search from '../Search/Search.jsx';
import { Box, Button, CardMedia, Typography } from '@mui/material';
import photo from '../../assets/home_main_photo.jpg';

function Home() {
    const { auth } = useContext(AppContext);
    const [token, setToken] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setToken(auth.token);
    }, [auth.token]);

    function redirectToRegister() {
        navigate('/register');
    }

    return (
        <Box className='home-page'>
            {
                token ? (
                    <Search />
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