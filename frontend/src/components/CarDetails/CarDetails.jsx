import AppContext from '../../state/AppContext';
import './CarDetails.css';
import React, { useContext, useEffect, useState } from 'react';

function CarDetails() {
    const { auth, cars } = useContext(AppContext);
    const [car, setCar] = useState('');
    const [images, setImages] = useState([]);

    useEffect(() => {
        setCar(cars.carsStore.getCar());

        setImages(cars.carsStore.getCar().Imagine.split(', '));
    }, []);

    return (
        <div className='car-details-page'>
            {
                images ? (
                    images.map(element => (
                        <div>
                            {/* <img src={element}></img> */}
                        </div>
                    ))
                ) : null
            }
        </div>
    );
}

export default CarDetails;