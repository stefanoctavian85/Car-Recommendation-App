import './Login.css';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';
import AppContext from '../../state/AppContext.jsx';

function Login() {
    const { auth, isAuthenticated, setIsAuthenticated, setToken } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
        }
    }, [isAuthenticated]);

    function validateCredentials() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError("Invalid email address!");
            return false;
        }

        if (password.length < 5 || password.length > 64) {
            setError("Password length must be between 5 and 64!");
            return false;
        }

        setError('');
        return true;
    }

    async function login() {
        if (!validateCredentials()) {
            return;
        }

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
        if (response.ok) {
            const token = data.token;
            localStorage.setItem("token", JSON.stringify(token));
            auth.login(token);
            setToken(token);
            setIsAuthenticated(auth.getAuthStatus());
            navigate("/");
        } else {
            setError(data.message);
        }
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
            <p className='login-error'>{error}</p>
        </div>
    );
}

export default Login;