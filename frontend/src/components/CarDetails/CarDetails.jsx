import './CarDetails.css';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';

function CarDetails() {
    const { auth, cars } = useContext(AppContext);
    const [selectedCar, setSelectedCar] = useState('');
    const [carOffers, setCarOffers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(cars.carsStore.cars);
        if (cars.carsStore.cars.length === 0) {
            navigate('/');
        }

        if (cars.carsStore.cars.length === 1) {
            fetch(`${SERVER}/api/cars`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cars.carsStore.cars)
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setCarOffers(data.cars);
                })
        } else {
            setCarOffers(cars.carsStore.cars);
        }
    }, [cars]);

    return (
        <div className='car-details-page'>
            
            {
                carOffers ? (
                    <div>
                        <ul>
                            {
                                carOffers.map((element, index) => (
                                    <div key={index}>
                                        <li>
                                            <p>{element.Masina}</p>
                                            <p>Color: {element.Culoare}</p>
                                            <p>Price: {element.Pret} EURO</p>
                                            <p>Year: {element['Anul productiei']}</p>
                                            <p>Average consumption: {Math.round(parseFloat(element['Consum Urban']) + parseFloat(element['Consum Extraurban'])) / 2}</p>
                                        </li>
                                        <button>Select</button>
                                    </div>
                                ))
                            }
                        </ul>
                    </div>
                ) : null
            }
        </div>
    );
}

export default CarDetails;