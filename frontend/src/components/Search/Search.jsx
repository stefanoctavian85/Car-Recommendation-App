import './Search.css';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';
import { Container, Select, MenuItem, InputLabel, FormControl, Button, Box, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SendIcon from '@mui/icons-material/Send';
import AppContext from '../../state/AppContext.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

function Search() {
    const { auth, cars } = useContext(AppContext);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isModelDisabled, setIsModelDisabled] = useState(true);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [selectedBodyType, setSelectedBodyType] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);

    const priceLimits = [
        { value: 5000, label: '5 000 EUR' },
        { value: 10000, label: '10 000 EUR' },
        { value: 30000, label: '30 000 EUR' },
        { value: 50000, label: '50 000 EUR' },
        { value: 100000, label: '100 000 EUR' },
    ];

    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        fetch(`${SERVER}/api/cars/brands`, {
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
                        throw new Error(error.message || '');
                    })
                }
            })
            .then((data) => {
                const options = data.brands.map(brand => ({
                    value: brand,
                    label: brand,
                }));
                setBrands(options);
            })
            .catch(() => {
                setBrands([]);
            });

        fetch(`${SERVER}/api/cars/bodytypes`, {
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
                        throw new Error(error.message || '');
                    })
                }
            })
            .then((data) => {
                const options = data.bodyTypes.map(bodytype => ({
                    value: bodytype,
                    label: bodytype,
                }));
                setBodyTypes(options);
            })
            .catch(() => {
                setBodyTypes([]);
            });

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (selectedBrand && selectedBrand !== 'Any') {
            fetch(`${SERVER}/api/cars/brands/${selectedBrand}`, {
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
                    const options = data.brandModels.map(model => ({
                        value: model,
                        label: model,
                    }));
                    setModels(options);
                    const timeout = setTimeout(() => {
                        setIsModelDisabled(false);
                    }, 500);
                    return () => clearTimeout(timeout);
                })
        } else {
            setIsModelDisabled(true);
            setModels([]);
            setSelectedModel('');
        }
    }, [selectedBrand]);

    async function searchCars(e) {
        e.preventDefault();

        const searchParamsObj = {
            brand: selectedBrand,
            model: selectedModel,
            bodytype: selectedBodyType,
            price: selectedPrice,
        };

        const filteredParams = Object.fromEntries(
            Object.entries(searchParamsObj).filter(([_, value]) => value)
        );

        setSearchParams(filteredParams);

        cars.carsStore.setSearchParams(filteredParams);
        navigate('/cars?' + new URLSearchParams(filteredParams).toString());
    }

    if (isLoading) {
        return (
            <Box className='loading-screen-search'>
                <LoadingScreen />
            </Box>
        );
    }

    return (
        <Container className='search-container'>
            <Box className='search-page'>
                <Box className='search-header'>
                    <DirectionsCarIcon className='search-car'/>
                    <Typography className='search-title'>
                        Looking for a car to rent?
                    </Typography>
                </Box>
                <form className='search-form' onSubmit={searchCars}>
                    <Box className='search-input'>
                        <FormControl sx={{ m: 1, minWidth: 200 }}>
                            <InputLabel id='brand-label'>Brand</InputLabel>
                            <Select
                                labelId='brand-label'
                                id='brand-input'
                                value={selectedBrand}
                                onChange={(e) => {
                                    setSelectedBrand(e.target.value);
                                    setSelectedModel('');
                                }}
                                label="Brand"
                                required
                            >
                                <MenuItem value={''}>Any</MenuItem>
                                {
                                    brands.map(brand => (
                                        <MenuItem key={brand.value} value={brand.value}>
                                            {brand.label}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className='search-input'>
                        <FormControl sx={{ m: 1, minWidth: 200 }}>
                            <InputLabel id='model-label'>Model</InputLabel>
                            <Select
                                labelId='model-label'
                                id='model-input'
                                value={selectedModel}
                                onChange={(e) => {
                                    setSelectedModel(e.target.value)
                                }}
                                label="Model"
                                disabled={isModelDisabled}
                                required
                            >
                                <MenuItem value={''}>Any</MenuItem>
                                {
                                    models.map(model => (
                                        <MenuItem key={model.value} value={model.value}>
                                            {model.label}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className='search-input'>
                        <FormControl sx={{ m: 1, minWidth: 200 }}>
                            <InputLabel id='price-label'>Price up to</InputLabel>
                            <Select
                                labelId='price-label'
                                id='price-input'
                                value={selectedPrice}
                                onChange={(e) => {
                                    setSelectedPrice(e.target.value)
                                }}
                                label="Price up to"
                                required
                            >
                                <MenuItem value={''}>Any</MenuItem>
                                {
                                    priceLimits.map(price => (
                                        <MenuItem key={price.value} value={price.value}>
                                            {price.label}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className='search-input'>
                        <FormControl sx={{ m: 1, minWidth: 200 }}>
                            <InputLabel id='body-type-label'>Body type</InputLabel>
                            <Select
                                labelId='body-type-label'
                                id='body-type-input'
                                value={selectedBodyType}
                                onChange={(e) => {
                                    setSelectedBodyType(e.target.value)
                                }}
                                label="Body type"
                                required
                            >
                                <MenuItem value={''}>Any</MenuItem>
                                {
                                    bodyTypes.map(bodytype => (
                                        <MenuItem key={bodytype.value} value={bodytype.value}>
                                            {bodytype.label}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className='search-button'>
                        <Button
                            variant='contained'
                            size='medium'
                            endIcon={<SendIcon className='search-icon' />}
                            onClick={(e) => searchCars(e)}
                        >Search</Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
}

export default Search;