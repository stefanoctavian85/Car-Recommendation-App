import './Form.css';
import data from '../../assets/data.jsx';
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';

function Form() {
    const { auth, cars } = useContext(AppContext);
    const [index, setIndex] = useState(0);
    const [rangeValue, setRangeValue] = useState(0);
    const [responses, setResponses] = useState([]);
    const [validResponse, setValidResponse] = useState(false);
    const [finalResponse, setFinalResponse] = useState('');
    const [predictions, setPredictions] = useState('');
    const navigate = useNavigate();

    let maxQuestions = data.length;

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/form');
        }
    }, [auth.isAuthenticated]);

    function handleFinalResponse(e) {
        if (e.target.value !== '') {
            setFinalResponse(e.target.value);
            setValidResponse(true);
        }
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

        const response = await fetch(`${SERVER}/api/users/${userId}/forms`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ responses: updatedResponses }),
        });

        if (response.ok) {
            const data = await response.json();
            setPredictions(data.cars);
            cars.carsStore.setCars(data.cars);
            setIndex(index + 1);
        }
    }

    function selectCar(indexCar) {
        cars.carsStore.setCars(predictions[indexCar]);
        navigate('/car-details');
    }

    return (
        <div className='form-page'>
            <h1>Recommendation Form</h1>
            <div className='form-container'>
                {
                    index < maxQuestions ? (
                        <div>
                            <div className='form-question'>
                                <p>{index + 1}. {data[index].question}</p>
                            </div>
                            {
                                data[index].type === 'choice' ? (
                                    <div className='form-option choice'>
                                        {
                                            data[index].options.map((item, index) => (
                                                <label key={index}>
                                                    <input
                                                        type='radio'
                                                        name='question'
                                                        value={item}
                                                        checked={finalResponse === item}
                                                        onChange={handleFinalResponse}
                                                        required
                                                    ></input>
                                                    {item}
                                                </label>
                                            ))
                                        }
                                    </div>
                                ) : data[index].type === 'range' ? (
                                    <div className='form-option range'>
                                        <input
                                            type='range'
                                            min={data[index].min}
                                            max={data[index].max}
                                            step={data[index].step}
                                            value={rangeValue}
                                            onChange={(e) => {
                                                setRangeValue(e.target.value);
                                                handleFinalResponse(e);
                                            }}
                                            required
                                        >
                                        </input>
                                        <h1>
                                            {rangeValue}
                                        </h1>
                                    </div>
                                ) : (
                                    <div className='form-option number'>
                                        <input
                                            type='number'
                                            min={data[index].min}
                                            max={data[index].max}
                                            onChange={handleFinalResponse}
                                            value={finalResponse}
                                            required
                                        ></input>
                                    </div>
                                )
                            }
                            <div className='form-button'>
                                <button className='form-btn' onClick={() => {
                                    if (index < maxQuestions - 1) {
                                        handleResponses();
                                    } else {
                                        submitForm();
                                    }
                                }}>
                                    {
                                        index < maxQuestions - 1 ? 'Next' : 'Save form'
                                    }
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <ul>
                                {
                                    predictions.map((element, indexCar) => (
                                        <div key={indexCar}>
                                            <li>{element}</li>
                                            <button onClick={() => selectCar(indexCar)}>Select</button>
                                        </div>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default Form;