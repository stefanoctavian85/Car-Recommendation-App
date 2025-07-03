import './Login.css';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';
import AppContext from '../../state/AppContext.jsx';
import { Box, Container, Avatar, Typography, FormControl, InputLabel, Input, InputAdornment, IconButton, Button, FormHelperText } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

function Login() {
    const { auth } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);

        if (auth.isAuthenticated && window.location.pathname === '/login') {
            navigate('/profile');
        }

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [auth.isAuthenticated, navigate]);

    function handleShowPassword() {
        setShowPassword(!showPassword);
    }

    function handleEmailChange(e) {
        const email = e.target.value;
        setEmail(email);
        if (emailTouched) {
            validateEmail(email);
        }
    }

    function handlePasswordChange(e) {
        const password = e.target.value;
        setPassword(password);
        if (passwordTouched) {
            validatePassword(password);
        }
    }

    function handleEmailLive(e) {
        setEmailTouched(true);
        validateEmail(e.target.value);
    }

    function handlePasswordLive(e) {
        setPasswordTouched(true);
        validatePassword(e.target.value);
    }

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

        if (!email) {
            setEmailError("Email is required!");
            return false;
        } else if (!emailRegex.test(email)) {
            setEmailError("Invalid email address!");
            return false;
        } else {
            setEmailError("");
            return true;
        }
    }

    function validatePassword(password) {
        if (!password) {
            setPasswordError("Password is required!");
            return false;
        } else if (password.length < 5 || password.length > 64) {
            setPasswordError("Password length must be between 5 and 64!");
            return false;
        } else {
            setPasswordError("");
            return true;
        }
    }

    function validateCredentials() {
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        return isEmailValid && isPasswordValid;
    }

    async function login() {
        if (!validateCredentials()) {
            return;
        }

        const userCredentials = {
            email, password,
        };
        try {
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
                const user = data.user;
                localStorage.setItem("token", JSON.stringify(token));
                auth.authStore.login(token, user);
                auth.setToken(token);
                auth.setIsAuthenticated(auth.authStore.getAuthStatus());
                navigate("/");
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("Something went wrong! Please try again later!");
        }
    }

    function register() {
        navigate('/register');
    }

    function handleSubmit(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            login();
        }
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Container maxWidth="sx" className='login-container'>
            <Box className='login-title'>
                <Avatar className='login-icon'>
                    <HowToRegIcon></HowToRegIcon>
                </Avatar>
                <Typography component="h1" className='login-text'>Log in</Typography>
            </Box>
            <Box className='all-components-form' component='form' onKeyDown={handleSubmit}>
                <Box className='login-form'>
                    <FormControl className='login-input' error={!!emailError}>
                        <InputLabel htmlFor='email-input' className='login-label'>Email</InputLabel>
                        <Input
                            id='email-input'
                            label='Email'
                            type='text'
                            onChange={handleEmailChange}
                            onBlur={handleEmailLive}
                            required
                            endAdornment={
                                emailTouched && (
                                    <InputAdornment position='end'>
                                        {
                                            emailError ? (
                                                <ErrorIcon color='error' />
                                            ) : (
                                                <CheckCircleIcon color='success' />
                                            )
                                        }
                                    </InputAdornment>
                                )
                            }
                        >
                        </Input>
                        {emailError ? (<FormHelperText className='login-input-error' error>{emailError}</FormHelperText>) : null}
                    </FormControl>
                </Box>
                <Box className='login-form'>
                    <FormControl className='login-input' error={!!passwordError}>
                        <InputLabel htmlFor='password-input' className='login-label'>Password</InputLabel>
                        <Input
                            id='password-input'
                            label='Password'
                            type={showPassword ? 'text' : 'password'}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordLive}
                            required
                            endAdornment={
                                <InputAdornment position='end'>
                                    {
                                        passwordTouched && (
                                            <>
                                                {
                                                    passwordError ? (
                                                        <ErrorIcon color='error' />
                                                    ) : password ? (
                                                        <CheckCircleIcon color='success' />
                                                    ) : null
                                                }
                                            </>
                                        )
                                    }
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'display the password' : 'hide the password'
                                        }
                                        className='show-password-icon'
                                        onClick={handleShowPassword}
                                        edge='end'
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        >
                        </Input>
                        {passwordError ? (<FormHelperText className='login-input-error' error>{passwordError}</FormHelperText>) : null}
                    </FormControl>
                </Box>
                <Box className='login-button'>
                    <Button
                        variant='contained'
                        onClick={login}
                    >
                        Log in
                    </Button>
                </Box>
                <Box className='login-error'>
                    {error ? <Typography className='login-error-text' component='h2'>{error}</Typography> : null}
                </Box>
                <Box className='redirect-register'>
                    <Typography
                        component='h2'
                        className='redirect-title'
                    >You don't have an account?</Typography>
                    <Button
                        className='redirect-button'
                        variant='contained'
                        onClick={register}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;