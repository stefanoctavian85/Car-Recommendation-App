import './Register.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.js';

function Register() {
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function validateCredentials() {
        
    }

    async function register() {
        const userCredentials = {
            email, firstname, lastname, password,
        };

        const response = await fetch(`${SERVER}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userCredentials)
        });

        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token", token);
        navigate("/");
    }

    return (
        <div className='register-page'>
            <h2>Create a new account!</h2>
            <p>Fill in the fields</p>
            <form className='form-register'>
                <div className='register-input'>
                    <label htmlFor='email-input'>Email</label>
                    <input
                        id='email-input'
                        type='text'
                        placeholder='Enter your email...'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='register-input'>
                    <label htmlFor='firstname-input'>First name</label>
                    <input
                        id='firstname-input'
                        type='text'
                        placeholder='Enter your first name...'
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                    />
                </div>
                <div className='register-input'>
                    <label htmlFor='lastname-input'>Last name</label>
                    <input
                        id='lastname-input'
                        type='text'
                        placeholder='Enter your last name...'
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                    />
                </div>
                <div className='register-input'>
                    <label htmlFor='password-input'>Password</label>
                    <input
                        id='password-input'
                        type='password'
                        placeholder='Enter your password...'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className='register-button' type='button' onClick={register}>Register</button>
            </form>
        </div>
    );
}

export default Register;