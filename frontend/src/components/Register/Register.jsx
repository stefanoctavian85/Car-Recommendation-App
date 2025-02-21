import './Register.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';

function Register() {
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');

    const navigate = useNavigate();

    function validateCredentials() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError("Invalid email address!");
            return false;
        }

        if (firstname.length < 3 || firstname.length > 20) {
            setError("First name length must be between 3 and 20!");
            return false;
        }

        if (lastname.length < 3 || lastname.length > 20) {
            setError("Last name length must be between 3 and 20!");
            return false;
        }

        if (password.length < 5 || password.length > 64) {
            setError("Password length must be between 5 and 64!");
            return false;
        }

        setError('');
        return true;
    }

    async function register() {
        if (!validateCredentials()) {
            return;
        }

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
        if (response.ok) {
            const token = data.token;
            localStorage.setItem("token", token);
            navigate("/");
        } else {
            setError(data.message);
            console.log(data.message);
        }
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
                        type='email'
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
                        minLength="3"
                        maxLength="20"
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
                        minLength="3"
                        maxLength="20"
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
            <p className='register-error'>{error}</p>
        </div>
    );
}

export default Register;