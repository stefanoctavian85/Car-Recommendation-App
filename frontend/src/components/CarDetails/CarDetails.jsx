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
        
    }, []);

    useEffect(() => {
        if (cars.carsStore.cars.length === 0) {
            navigate('/form');
        } else {
            setSelectedCar(cars.carsStore.cars);
            const userId = jwtDecode(auth.token).id;
    
            fetch(`${SERVER}/api/users/${userId}/cars/${cars.carsStore.cars}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setCarOffers(data.cars);
                });
        }
    }, [cars]);

    return (
        <div className='car-details-page'>
            <p>Your selected car is: {selectedCar}</p>
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