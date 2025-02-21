import './Login.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.js';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function login() {
        const userCredentials = {
            email, password,
        };

        const response = await fetch(`${SERVER}/auth/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCredentials)
        });
        
        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token", token);
        navigate("/");
    }

    return (
        <div className='login-page'>
            <h2>Welcome back!</h2>
            <p>Login to access your account!</p>
            <form className='login-form'>
                <div className='login-input'>
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
                <div className='login-form'>
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
                <button className='login-button' type='button' onClick={login}>Log in</button>
            </form>
        </div>
    );
}

export default Login;