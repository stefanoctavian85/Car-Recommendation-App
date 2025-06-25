import './Recommendation.css';
import data from '../../assets/data.jsx';
import { useState, useContext, useEffect } from 'react';
import { Container, Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Button, Grid2, Slider, Input, TextField } from '@mui/material';
import { NumberField } from '@base-ui-components/react/number-field';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

const MAX_LENGTH_TEXT = 200;

function Recommendation() {
    const { auth } = useContext(AppContext);
    const [recommendationType, setRecommendationType] = useState('');
    const [tempRecommendationType, setTempRecommendationType] = useState('');

    const [text, setText] = useState('');

    const [index, setIndex] = useState(0);
    const [rangeValue, setRangeValue] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);

    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [validResponse, setValidResponse] = useState(false);
    const [finalResponse, setFinalResponse] = useState('');
    const [predictions, setPredictions] = useState('');

    const [error, setError] = useState('');
    const [typingError, setTypingError] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    let maxQuestions = data.length;

    useEffect(() => {
        setIsLoading(true);

        if (!auth.isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/recommendation');
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [auth.isAuthenticated]);

    function selectRecommendationType(e) {
        setTempRecommendationType(e.target.value);
    }

    function redirectToRecommendations() {
        setRecommendationType(tempRecommendationType);
    }

    function setTextForRecommendations(e) {
        if (e.target.value.length <= MAX_LENGTH_TEXT) {
            setText(e.target.value);
        }
    }

    async function sendTextForRecommendations() {
        if (text.length < 30) {
            setError("A minimum of 30 characters is required to receive a recommendation!")
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${SERVER}/api/users/recommendations-by-text`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (response.ok) {
                setPredictions(data.cars);
                setError('');
                navigate('/recommendation/results', {
                        state: {
                            predictions: data.cars
                        }
                    });
            } else {
                setError(data.message);
                navigate('/recommendation/results', {
                        state: {
                            error: fetchData.message,
                        }
                });
            }
        } catch (error) {
            setError(error);
        } finally {
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }

    function handleFinalResponse(e) {
        if (e.target.value !== '') {
            if (data[index].type === 'range' && e.target.value >= data[index].min && e.target.value <= data[index].max) {
                setFinalResponse(e.target.value);
                setValidResponse(true);
                setTypingError('');
            } else if (data[index].type === 'choice') {
                setFinalResponse(e.target.value);
                setValidResponse(true);
                setTypingError('');
            } else if (data[index].type === 'number') {
                const min = data[index].min;
                const max = data[index].max;
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
                setTypingError('');
            } else {
                setTypingError(`Please insert a value between ${data[index].min} and ${data[index].max}!`)
            }
        } else {
            setTypingError("Please answer the question!");
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
            setTypingError("Please answer the question!");
        } else if (finalResponse < data[index].min || finalResponse > data[index].max) {
            setTypingError(`Please insert a value between ${data[index].min} and ${data[index].max}!`);
        }

        if (validResponse === true && typingError === '') {
            setQuestions([...questions, data[index].question]);
            setResponses([...responses, finalResponse]);
            setFinalResponse('');
            setRangeValue(0);
            setValidResponse(false);
            setCurrentValue(0);
            setTypingError('');

            if (index < maxQuestions - 1) {
                setIndex(index + 1);
            }
        }
    }

    async function submitForm() {
        if (finalResponse === '') {
            setTypingError("Please answer the question!");
        } else {
            setTypingError('');
            setIsLoading(true);
            const updatedResponses = [...responses, finalResponse];
            const updatedQuestions = [...questions, data[index].question];
            setIndex(index + 1);
            try {
                const response = await fetch(`${SERVER}/api/users/forms`, {
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

                const fetchData = await response.json();

                if (response.ok) {
                    setPredictions(fetchData.cars);
                    setError('');
                    navigate('/recommendation/results', {
                        state: {
                            predictions: fetchData.cars
                        }
                    });
                } else {
                    setError(fetchData.message);
                    navigate('/recommendation/results', {
                        state: {
                            error: fetchData.message,
                        }
                    });
                }
            } catch (error) {
                setError(error);
            } finally {
                const timeout = setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
                return () => clearTimeout(timeout);
            }
        }
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <Container className='form-page'>
            <Box className='form-title'>
                <Typography component='h2' className='form-text'>Recommendation System</Typography>
            </Box>
            {
                recommendationType === '' && (<Box>
                    <Box className='form-select'>
                        <Typography className='form-select-text'>Please choose how to respond to the recommendation.</Typography>
                    </Box>
                    <Box className='form-radio-group choice'>
                        <FormControl>
                            <RadioGroup
                                onClick={selectRecommendationType}
                            >
                                <FormControlLabel className='label-select' value='form' label='Form' control={<Radio />} />
                                <FormControlLabel className='label-select' value='description' label='Description' control={<Radio />} />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box className='form-select-redirect form-button'>
                        <Button
                            className='form-select-button'
                            variant='contained'
                            onClick={redirectToRecommendations}
                        >
                            Select
                        </Button>
                    </Box>
                </Box>
                )
            }

            {
                recommendationType === 'description' && (<Box>
                    {
                        predictions.length === 0 && (
                            <Box>
                                <Box className='form-description'>
                                    <Typography className='form-description-title'>Please write a detailed message about the type of a car you're looking for</Typography>
                                </Box>

                                <Box className='form-description-content' component='form'>
                                    <Box className='form-description-input-area'>
                                        <TextField
                                            className='form-description-text'
                                            required
                                            multiline
                                            rows={4}
                                            value={text}
                                            onChange={setTextForRecommendations}
                                            inputprops={{
                                                maxLength: 300,
                                            }}
                                        />
                                    </Box>

                                    <Box className='form-description-length'>
                                        <Typography className='form-max-characters'>{text.length} / {MAX_LENGTH_TEXT} max. number of characters</Typography>
                                    </Box>

                                    <Box className='form-button'>
                                        <Button
                                            className='form-description-button'
                                            variant='contained'
                                            onClick={sendTextForRecommendations}
                                        >
                                            Submit
                                        </Button>
                                    </Box>

                                    <Box className='form-error'>
                                        <Typography className='form-error-text'>{error}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )
                    }
                </Box>
                )
            }

            {
                recommendationType === 'form' && (<Box>
                    <Box className='form-container'>
                        {
                            index < maxQuestions && (
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
                                                                    className='label-select'
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
                                                            onBlur={(e) => handleFinalResponse(e)}
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
                                                            onChange={(e) => handleFinalResponse(e)}
                                                            onBlur={(e) => handleFinalResponse(e)}
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

                                    <Box className='form-typing-error'>
                                        <Typography className='form-typing-error-text'>{typingError}</Typography>
                                    </Box>
                                </Box>
                            )
                        }
                    </Box>
                </Box>
                )
            }
        </Container>
    );
}

export default Recommendation;