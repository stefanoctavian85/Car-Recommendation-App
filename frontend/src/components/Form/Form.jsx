import './Form.css';
import data from '../../assets/data.jsx';
import React, { useState, useContext, useEffect } from 'react';
import { Container, Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Button, Grid2, Slider, Input, List, ListItem } from '@mui/material';
import { NumberField } from '@base-ui-components/react/number-field';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

function Form() {
    const { auth, cars } = useContext(AppContext);
    const [index, setIndex] = useState(0);
    const [rangeValue, setRangeValue] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);

    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [validResponse, setValidResponse] = useState(false);
    const [finalResponse, setFinalResponse] = useState('');
    const [predictions, setPredictions] = useState('');

    const [error, setError] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    let maxQuestions = data.length;

    useEffect(() => {
        setIsLoading(true);

        if (!auth.isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/form');
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [auth.isAuthenticated]);

    function handleFinalResponse(e) {
        if (e.target.value !== '') {
            setFinalResponse(e.target.value);
            setValidResponse(true);
        }
    }

    function checkInput(e, min, max) {
        if (e.target.value < min) {
            setFinalResponse(min);
            setValidResponse(true);
        } else if (e.target.value > max) {
            setFinalResponse(max);
            setValidResponse(true);
        } else {
            setFinalResponse(e.target.value);
            setValidResponse(true);
        }
    }

    function handleDecrement(min) {
        setCurrentValue((prev) => Math.max(prev - 1, min));
    }

    function handleIncrement(max) {
        setCurrentValue((prev) => Math.min(prev + 1, max));
    }

    function handleResponses() {
        if (finalResponse === '') {
            alert('Please answer the question!');
            return;
        } else if (finalResponse < data[index].min || finalResponse > data[index].max) {
            alert(`Please insert a value between ${data[index].min} and ${data[index].max}`);
            return;
        }

        if (validResponse === true) {
            setQuestions([...questions, data[index].question]);
            setResponses([...responses, finalResponse]);
            setFinalResponse('');
            setRangeValue(0);
            setValidResponse(false);

            if (index < maxQuestions - 1) {
                setIndex(index + 1);
            }
        }
    }

    async function submitForm() {
        const userId = jwtDecode(auth.token).id;

        const updatedResponses = [...responses, finalResponse];
        const updatedQuestions = [...questions, data[index].question];

        setIsLoading(true);
        const response = await fetch(`${SERVER}/api/users/${userId}/forms`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questions: updatedQuestions,
                responses: updatedResponses,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            setPredictions(data.cars);
            setIndex(index + 1);
            setError('');
        } else {
            setError('An error occured. Please try again later!');
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }

    function selectCar(indexCar) {
        const selectedCar = predictions[indexCar];
        const carParts = selectedCar.split(" ");
        cars.carsStore.setSearchParams({
            brand: carParts[0],
            model: carParts[1]
        });
        navigate('/cars?' + new URLSearchParams(cars.carsStore.getSearchParams()).toString());
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Container className='form-page'>
            <Box className='form-title'>
                <Typography component='h2' className='form-text'>Recommendation Form</Typography>
            </Box>
            <Box className='form-container'>
                {
                    index < maxQuestions ? (
                        <Box className='form-box'>
                            <Box className='form-question'>
                                <Typography component='h3' className='question'>
                                    {index + 1}. {data[index].question}
                                </Typography>
                            </Box>
                            {
                                data[index].type === 'choice' && (
                                    <Box className='form-option choice'>
                                        <FormControl>
                                            <RadioGroup
                                                onClick={handleFinalResponse}
                                            >
                                                {
                                                    data[index].options.map((item, index) => (
                                                        <FormControlLabel
                                                            key={index}
                                                            value={item}
                                                            label={item}
                                                            control={<Radio />}
                                                        />
                                                    ))
                                                }
                                            </RadioGroup>
                                        </FormControl>
                                    </Box>
                                )
                            }

                            {
                                data[index].type === 'range' && (
                                    <Box className='form-option range'>
                                        <Grid2>
                                            <Grid2 className='grid-slider'>
                                                <Slider
                                                    onChange={(e) => {
                                                        setRangeValue(e.target.value);
                                                        handleFinalResponse(e);
                                                    }}
                                                    value={parseFloat(rangeValue)}
                                                    defaultValue={data[index].min}
                                                    min={data[index].min}
                                                    max={data[index].max}
                                                    aria-labelledby='input-slider'
                                                />
                                            </Grid2>

                                            <Grid2 className='grid-slider-input'>
                                                <Input
                                                    className='slider-input'
                                                    value={parseFloat(rangeValue)}
                                                    onChange={(e) => {
                                                        setRangeValue(e.target.value);
                                                        handleFinalResponse(e);
                                                    }}
                                                    onBlur={(e) => checkInput(e, data[index].min, data[index].max)}
                                                    inputProps={{
                                                        step: 10,
                                                        min: data[index].min,
                                                        max: data[index].max,
                                                        type: 'number',
                                                        'aria-labelledby': 'input-slider'
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Box>
                                )
                            }

                            {
                                data[index].type === 'number' && (
                                    <Box className='form-option number'>
                                        <NumberField.Root className='input-number' defaultValue={data[index].min}>
                                            <NumberField.Group>
                                                <NumberField.Decrement
                                                    className='input-number-button'
                                                    onClick={() => handleDecrement(data[index].min)}
                                                    disabled={currentValue <= data[index].min}
                                                >
                                                    <RemoveIcon />
                                                </NumberField.Decrement>
                                                <NumberField.Input
                                                    className='input-number-field'
                                                    value={currentValue}
                                                    onChange={handleFinalResponse}
                                                    onBlur={(e) => checkInput(e, data[index].min, data[index].max)}
                                                    inputprops={{
                                                        min: data[index].min,
                                                        max: data[index].max,
                                                    }}
                                                />
                                                <NumberField.Increment
                                                    className='input-number-button'
                                                    onClick={() => handleIncrement(data[index].max)}
                                                    disabled={currentValue >= data[index].max}
                                                >
                                                    <AddIcon />
                                                </NumberField.Increment>
                                            </NumberField.Group>
                                        </NumberField.Root>
                                    </Box>
                                )
                            }
                            <Box className='form-button'>
                                <Button onClick={() => {
                                    if (index < maxQuestions - 1) {
                                        handleResponses();
                                    } else {
                                        submitForm();
                                    }
                                }}>
                                    {
                                        index < maxQuestions - 1 ? 'Next' : 'Save form'
                                    }
                                </Button>
                            </Box>
                        </Box>
                    ) : predictions.length > 0 ? (
                        <Box className='form-predictions'>
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
                        </Box>
                    ) : (
                        <Box className='form-error'>
                            {error}
                        </Box>
                    )
                }
            </Box>
        </Container>
    );
}

export default Form;