import './LoadingScreen.css';
import React from 'react';
import { Box, Typography } from '@mui/material';
import LogoLoadingScreen from '../../assets/LogoLoadingScreen.svg';

function LoadingScreen() {
    return (
        <Box className='loading-screen-page'>
            <Box className='loading-container'>
                <Box className='loading-car'>
                    <Box 
                        className='loading-car-logo'
                        component='img'
                        src={LogoLoadingScreen}
                        alt='Car animation'
                    />
                </Box>
                <Box className='loading-road'>
                    <Typography className='track-separator'>.</Typography>
                    <svg viewBox='0 0 500 100' className='loading-track'>
                        <line x1='0' y1='30' x2='500' y2='30' stroke='#FFF' className='first-line'/>
                        <line x1='0' y1='50' x2='500' y2='50' stroke='#FFF' strokeDasharray='20' className='middle-line' />
                        <line x1='0' y1='70' x2='500' y2='70' stroke='#FFF' className='second-line'/>
                    </svg>
                    <Typography className='track-separator'>.</Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default LoadingScreen;