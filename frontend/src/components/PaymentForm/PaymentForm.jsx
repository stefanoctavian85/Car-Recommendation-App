import { Box, Button, Typography } from '@mui/material';
import './PaymentForm.css';
import { useContext, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CLIENT, SERVER } from '../../config/global';
import { useLocation, useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';

function PaymentForm({ car, startDate, endDate, insuranceOptions, rentalPrice }) {
    const { auth } = useContext(AppContext);
    const stripe = useStripe();
    const elements = useElements();
    let navigate = useNavigate();
    let location = useLocation();

    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${CLIENT}/rent-confirmation`,
            },
            redirect: 'if_required',
        });


        if (result.error) {
            setErrorMessage(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                setErrorMessage('');
                if (location.state.from === '/car-details') {
                    fetch(`${SERVER}/api/reservations/rent-car`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${auth.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cid: car._id,
                            startDate,
                            endDate,
                            insuranceOptions,
                            rentalPrice
                        })
                    })
                        .then(res => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                return res.json().then((error) => {
                                    throw new Error(error.message || 'Payment failed!')
                                });
                            }
                        })
                        .then(data => {
                            if (data.completed === true) {
                                navigate(`/rent-confirmation?payment_intent=${result.paymentIntent.id}`, { replace: true });
                            } else {
                                setErrorMessage(data.message);
                            }
                        })
                        .catch((error) => {
                            console.error(error.message);
                            setErrorMessage(error.message);
                        })
                } else if (location.state.from === '/profile') {
                    fetch(`${SERVER}/api/reservations/change-rental-details`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${auth.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cid: car._id,
                            startDate,
                            endDate,
                            insuranceOptions,
                            rentalPrice
                        })
                    })
                        .then(res => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                return res.json().then((error) => {
                                    throw new Error(error.message || 'Changing rental details payment failed!');
                                })
                            }
                        })
                        .then(data => {
                            if (data.completed === true) {
                                navigate(`/rent-confirmation?payment_intent=${result.paymentIntent.id}`, { replace: true });
                            } else {
                                setErrorMessage(data.message);
                            }
                        })
                        .catch((error) => {
                            console.error(error.message);
                            setErrorMessage(error.message);
                        });
                }
            }
        }
    }

    return (
        <Box className='payment-form'>
            <Box component='form' onSubmit={handleSubmit}>
                <PaymentElement className='payment-content' />
                <Box className='payment-submit'>
                    <Button
                        type='submit'
                        variant='contained'
                        className='payment-submit-button'
                        disabled={!stripe}
                    >Pay now</Button>
                </Box>
            </Box>

            {
                errorMessage && <Box className='payment-error'>
                    <Box className='payment-error-section'>
                        <Typography className='payment-error-message'>{errorMessage}</Typography>
                    </Box>
                    <Box className='payment-error-redirect'>
                        <Typography className='payment-error-redirect-message'>Want to go back to home page?</Typography>
                        <Button
                            className='payment-error-redirect-button'
                            variant='contained'
                            onClick={() => navigate('/')}
                        >Home</Button>
                    </Box>
                </Box>
            }
        </Box>
    );
}

export default PaymentForm;