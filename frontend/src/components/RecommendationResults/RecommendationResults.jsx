import './RecommendationResults.css';
import AppContext from '../../state/AppContext';
import { useContext, useEffect, useState } from 'react';
import { Box, List, ListItem, Typography, Button } from '@mui/material';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import { useLocation, useNavigate } from 'react-router-dom';

function RecommendationResults() {
    const { auth, cars } = useContext(AppContext);

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(location.state?.error || 'No recommedations could be given!');

    const predictions = location.state?.predictions || [];

    useEffect(() => {
        setIsLoading(true);

        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        } else if (predictions.length === 0) {
            setError('Internal Server Error! Please try again later!');
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, []);

    function selectCar(indexCar) {
        const selectedCar = predictions[indexCar];
        const carParts = selectedCar.split(" ");
        const brand = carParts[0];
        const model = carParts.slice(1).join(" ");
        cars.carsStore.setSearchParams({
            brand: brand,
            model: model,
        });
        navigate('/cars?' + new URLSearchParams(cars.carsStore.getSearchParams()).toString());
    }

    function redirectHome() {
        navigate('/');
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Box className='form-results-page'>
            <Box className='form-title'>
                <Typography component='h2' className='form-text'>Recommendation System</Typography>
            </Box>
            {
                predictions.length > 0 ? (
                    <Box className='form-predictions' >
                        <List>
                            {
                                predictions.map((item, indexCar) => (
                                    <ListItem key={indexCar}>
                                        <Box className='select-predicted-car'>
                                            <Typography className='predicted-car'>{item}</Typography>
                                            <Button
                                                onClick={() => selectCar(indexCar)}
                                            >
                                                Select
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </Box >
                ) : (
                    <Box className='form-error'>
                        <Typography className='form-error-text'>{error}</Typography>
                        <Button
                            variant='contained'
                            className='form-error-button'
                            onClick={redirectHome}>
                            Home
                        </Button>
                    </Box>
                )
            }
        </Box>
    );
}

export default RecommendationResults;