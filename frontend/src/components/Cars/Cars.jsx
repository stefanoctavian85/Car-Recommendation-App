import './Cars.css';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { Container, Typography, Box, List, ListItem, Card, CardContent, Grid2, Pagination, Button } from '@mui/material';
import EmblaCarousel from '../GalleryCarousel/EmblaCarousel.jsx';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import EuroIcon from '@mui/icons-material/Euro';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

function Cars() {
    const { auth, cars } = useContext(AppContext);
    const [carOffers, setCarOffers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCars, setTotalCars] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);

        let webParams = {};
        if (Object.keys(cars.carsStore.searchParams).length !== 0) {
            webParams = {
                brand: cars.carsStore.searchParams.brand || '',
                model: cars.carsStore.searchParams.model || '',
                bodytype: cars.carsStore.searchParams.bodytype || '',
                price: cars.carsStore.searchParams.price || '',
            }
        } else {
            webParams = {
                brand: searchParams.get("brand") || '',
                model: searchParams.get("model") || '',
                bodytype: searchParams.get("bodytype") || '',
                price: searchParams.get("price") || '',
            }

            if (Object.keys(webParams).some((key) => webParams[key] !== '')) {
                cars.carsStore.setSearchParams(webParams);
            }
        }

        getCars(webParams, currentPage);

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [searchParams, currentPage]);

    function getCars(webParams, currentPage) {
        fetch(`${SERVER}/api/cars?brand=${webParams.brand}&model=${webParams.model}&bodytype=${webParams.bodytype}&price=${webParams.price}&page=${currentPage}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setCarOffers(data.cars);
                setTotalCars(data.totalCars);
                setTotalPages(data.totalPages);
            })
    }

    function handlePageChange(event, page) {
        setIsLoading(true);
        const webParams = {
            brand: searchParams.get("brand") || '',
            model: searchParams.get("model") || '',
            bodytype: searchParams.get("bodytype") || '',
            price: searchParams.get("price") || '',
        }

        const filteredParams = Object.fromEntries(
            Object.entries(webParams).filter(([_, value]) => value)
        );

        setCurrentPage(page);

        navigate('/cars?' + new URLSearchParams(filteredParams).toString() + '&page=' + page);

        getCars(filteredParams, page);
        window.scrollTo(0, 0);
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }

    function seeDetails(index) {
        cars.carsStore.setCar(carOffers[index]);
        navigate('/car-details?' + new URLSearchParams({ id: carOffers[index]._id}).toString());
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Container className='cars-page'>
            <Box className='cars-results-title'>
                <Typography component='h1' className='results-title'>Searched cars</Typography>
                <Typography component='h2' className='results-number'>Found {totalCars} cars!</Typography>
            </Box>
            <Box className='cars-results'>
                {
                    carOffers.length > 0 ? (
                        <Box className='results-container'>
                            <List className='results-list'>
                                {
                                    carOffers.map((element, index) => (
                                        <ListItem
                                            className='result-car'
                                            key={index}
                                        >
                                            <Card
                                            >
                                                <CardContent className='results'>
                                                    <Box className='results-car-images'>
                                                        <EmblaCarousel images={element.Imagine} />
                                                    </Box>
                                                    <Box className='results-car-details'>
                                                        <Typography component='h2' className='results-car-name'>
                                                            {element.Masina}
                                                        </Typography>
                                                        <Typography component='h3' className='results-car-version'>
                                                            {element?.Versiune}
                                                        </Typography>
                                                        <Grid2 container spacing={2} className='car-details-container'>
                                                            <Grid2 size={4} className='results-car-fuel'>
                                                                <Box className='icon-text'>
                                                                    <LocalGasStationIcon />
                                                                    <Typography component='h4' className='detail'>
                                                                        {element.Combustibil}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid2>
                                                            <Grid2 size={4} className='results-car-km'>
                                                                <Box className='icon-text'>
                                                                    <AddRoadIcon />
                                                                    <Typography component='h4' className='detail'>
                                                                        {element.KM} km
                                                                    </Typography>
                                                                </Box>
                                                            </Grid2>
                                                            <Grid2 size={4} className='results-car-year'>
                                                                <Box className='icon-text'>
                                                                    <CalendarMonthIcon />
                                                                    <Typography component='h4' className='detail'>
                                                                        {element['Anul productiei']}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid2>
                                                        </Grid2>
                                                        <Grid2 container spacing={2} className='price-select'>
                                                            <Grid2 size={6}>
                                                                <Box className='results-price'>
                                                                    <Typography className='result-price'>
                                                                        {element.Pret}
                                                                    </Typography>
                                                                    <EuroIcon className='price-icon' />
                                                                </Box>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Box className='results-button'>
                                                                    <Button onClick={() => seeDetails(index)}>
                                                                        <Typography component='h3' className='results-select-button'>Select</Typography>
                                                                        <ShoppingCartIcon className='shop-icon'/>
                                                                    </Button>
                                                                </Box>
                                                            </Grid2>
                                                        </Grid2>

                                                    </Box>

                                                </CardContent>
                                            </Card>
                                        </ListItem>
                                    ))
                                }
                            </List>
                            <Box className='results-pagination'>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                />
                            </Box>
                        </Box>

                    ) : (
                        <Typography>No results found!</Typography>
                    )
                }
            </Box>
        </Container>
    );
}

export default Cars;