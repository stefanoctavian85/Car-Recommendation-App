import './RentConfirmation.css';
import { Box, Button, Typography } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SERVER } from '../../config/global';
import AppContext from '../../state/AppContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

function RentConfirmation() {
    const { auth } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    let navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paymentIntent = params.get('payment_intent');

        if (!paymentIntent) {
            navigate('/');
        } else {
            setIsLoading(true);
            fetch(`${SERVER}/api/reservations/check-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentIntent }),
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    if (data.succeeded === false) {
                        navigate('/');
                    }
                })
                .catch((err) => {
                    navigate('/');
                })
                .finally(() => {
                    const timeout = setTimeout(() => {
                        setIsLoading(false);
                    }, 1000);
                    return () => clearTimeout(timeout);
                });
        }
    }, []);

    function seeRentedCars() {
        navigate('/profile', {
            state: {
                valueTab: '2'
            }
        });
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <Box className='rent-confirmation-page'>
            <Box className='rental-final'>
                <Box className='rental-final-success'>
                    <Typography component='h1' className='rental-final-title'>Congratulations!</Typography>
                    <EmojiEmotionsIcon className='success-icon' />
                </Box>
                <Box className='rental-final-content'>
                    <Typography component='h2' className='rental-final-subtitle'>The payment was successful!</Typography>
                    <Typography component='h3' className='rental-final-text'>
                        Thank you for trusting us and our services!
                        From now on, you can see your new car on your profile!
                    </Typography>
                    <Typography className='team-message'>The CarMinds team wishes you safe travels and enjoy your car!</Typography>
                </Box>

                <Box className='rental-final-button'>
                    <Button
                        variant='contained'
                        className='see-rented-cars-button'
                        onClick={() => seeRentedCars()}
                    >
                        Profile
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default RentConfirmation;