import './Register.css';
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/global.jsx';
import AppContext from '../../state/AppContext.jsx';
import { Box, Container, Typography, Button, Avatar, FormControl, Input, InputAdornment, IconButton, InputLabel, FormHelperText } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function Register() {
    const { auth } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [firstnameError, setFirstnameError] = useState('');
    const [lastnameError, setLastnameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [emailTouched, setEmailTouched] = useState(false);
    const [firstnameTouched, setFirstnameTouched] = useState(false);
    const [lastnameTouched, setLastnameTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/profile');
        }
    }, [auth.isAuthenticated]);

    function handleShowPassword() {
        setShowPassword(!showPassword);
    }

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

    function validateFirstname(firstname) {
        if (!firstname) {
            setFirstnameError("First name is required!");
            return false;
        } else if (firstname.length < 3 || firstname.length > 20) {
            setFirstnameError("First name length must be between 3 and 20!");
            return false;
        } else {
            setFirstnameError("");
            return true;
        }
    }

    function validateLastname(lastname) {
        if (!lastname) {
            setLastnameError("Last name is required!");
            return false;
        } else if (lastname.length < 3 || lastname.length > 20) {
            setLastnameError("Last name length must be between 3 and 20!");
            return false;
        } else {
            setLastnameError("");
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

    function handleEmailChange(e) {
        const email = e.target.value;
        setEmail(email);
        if (emailTouched) {
            validateEmail(email);
        }
    }

    function handleFirstnameChange(e) {
        const firstname = e.target.value;
        setFirstname(firstname);
        if (firstnameTouched) {
            validateFirstname(firstname);
        }
    }

    function handleLastnameChange(e) {
        const lastname = e.target.value;
        setLastname(lastname);
        if (lastnameTouched) {
            validateLastname(lastname);
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

    function handleFirstnameLive(e) {
        setFirstnameTouched(true);
        validateFirstname(e.target.value);
    }

    function handleLastnameLive(e) {
        setLastnameTouched(true);
        validateLastname(e.target.value);
    }

    function handlePasswordLive(e) {
        setPasswordTouched(true);
        validatePassword(e.target.value);
    }

    function validateCredentials() {
        const isEmailValid = validateEmail(email);
        const isFirstnameValid = validateFirstname(firstname);
        const isLastnameValid = validateLastname(lastname);
        const isPasswordValid = validatePassword(password);

        return isEmailValid && isFirstnameValid && isLastnameValid && isPasswordValid;
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
            localStorage.setItem("token", JSON.stringify(token));
            auth.authStore.login(token);
            auth.setIsAuthenticated(auth.authStore.getAuthStatus());
            navigate("/");
        } else {
            setError(data.message);
        }
    }

    return (
        <Container maxWidth="sx">
            <Box className="register-title">
                <Avatar className='register-icon'>
                    <HowToRegIcon></HowToRegIcon>
                </Avatar>
                <Typography component="h1">Create a new account</Typography>
            </Box>
            <Box className='register-form' component='form'>
                <FormControl className='register-input' error={!!emailError}>
                    <InputLabel htmlFor='email-input'>Email</InputLabel>
                    <Input
                        id='email-input'
                        onChange={handleEmailChange}
                        onBlur={handleEmailLive}
                        label="Email"
                        type='text'
                        required
                        endAdornment={
                            emailTouched && (
                                <InputAdornment position='end'>
                                    {
                                        emailError ? (
                                            <ErrorIcon color='error' />
                                        ) :
                                            <CheckCircleIcon color='success' />
                                    }
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                    {emailError ? (<FormHelperText error>{emailError}</FormHelperText>) : null}
                </FormControl>
            </Box>
            <Box className='register-form' component='form'>
                <FormControl className='register-input' error={!!firstnameError}>
                    <InputLabel htmlFor='firstname-input'>First name</InputLabel>
                    <Input
                        id='firstname-input'
                        onChange={handleFirstnameChange}
                        onBlur={handleFirstnameLive}
                        label="First name"
                        type='text'
                        required
                        endAdornment={
                            firstname && (
                                <InputAdornment position='end'>
                                    {
                                        firstnameError ? (
                                            <ErrorIcon color='error' />
                                        ) :
                                            <CheckCircleIcon color='success' />
                                    }
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                    {firstnameError ? (<FormHelperText error>{firstnameError}</FormHelperText>) : null}
                </FormControl>
            </Box>
            <Box className='register-form' component='form'>
                <FormControl className='register-input' error={!!lastnameError}>
                    <InputLabel htmlFor='lastname-input'>Last name</InputLabel>
                    <Input
                        id='lastname-input'
                        onChange={handleLastnameChange}
                        onBlur={handleLastnameLive}
                        label="Last name"
                        type='text'
                        required
                        endAdornment={
                            lastnameTouched && (
                                <InputAdornment position='end'>
                                    {
                                        lastnameError ? (
                                            <ErrorIcon color='error' />
                                        ) :
                                            <CheckCircleIcon color='success' />
                                    }
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                    {lastnameError ? (<FormHelperText error>{lastnameError}</FormHelperText>) : null}
                </FormControl>
            </Box>
            <Box className='register-form' component='form'>
                <FormControl className='register-input' error={!!passwordError}>
                    <InputLabel htmlFor='password-input'>Password</InputLabel>
                    <Input
                        id='password-input'
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordLive}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
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
                                                ) : null}
                                        </>
                                    )
                                }
                                <IconButton
                                    aria-label={
                                        showPassword ? 'hide the password' : 'display the password'
                                    }
                                    onClick={handleShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    >
                    </Input>
                    {passwordError ? (<FormHelperText error>{passwordError}</FormHelperText>) : null}
                </FormControl>
            </Box>
            <Box className='register-button'>
                <Button
                    variant='contained'
                    endIcon={<SendIcon />}
                    onClick={register}
                >
                    Sign Up
                </Button>
            </Box>
            <Box className='register-error'>
                {error ? (<Typography>{error}</Typography>) : null}
            </Box>
        </Container>
    );
}

export default Register;