import './Profile.css';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext.jsx';
import { SERVER } from '../../config/global.jsx';
import { jwtDecode } from 'jwt-decode';

function Profile() {
    const { auth } = useContext(AppContext);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userId = jwtDecode(auth.token).id;

        fetch(`${SERVER}/api/users/${userId}/profile`, {
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
                setFirstname(data.user.firstname);
                setLastname(data.user.lastname);
            });
    }, []);

    return (
        <div>
            <p>Profile</p>
            <p>First name: {firstname}</p>
            <p>Last name: {lastname}</p>
        </div>
    );
}

export default Profile;