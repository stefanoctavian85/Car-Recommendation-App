import './Navbar.css';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Container, Toolbar, Box, Button, Menu, MenuItem, Typography, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import logo from '../../assets/Logo.svg';

const pages = ['Form'];
const settings = ['Profile', 'Log out'];

function Navbar() {
    const { auth } = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setIsAuthenticated(auth.isAuthenticated);
        if (!auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated]);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    }

    const handleCloseUserMenu = (event) => {
        setAnchorElUser(null);
        if (event.target.textContent === "Profile") {
            navigate('/profile');
        } else if (event.target.textContent === "Log out") {
            logout();
            window.location.reload();
        }
    }

    function handleLoginStatus() {
        navigate('/login');
    }

    function logout() {
        auth.authStore.logout();
        auth.setIsAuthenticated(false);
        navigate("/");
    }

    function handlePages(event) {
        if (isAuthenticated) {
            if (event.target.textContent === "Form") {
                navigate('/form');
            }
        } else {
            navigate('/login');
        }
    }

    return (
        <AppBar className='navbar'>
            <Container disableGutters maxWidth={false} className='nav-container'>
                <Toolbar className='nav-toolbar'>
                    <Box className='navbar-left-section'>
                        <Box
                            component={Link}
                            to='/'
                        >
                            <Box
                                className='navbar-logo'
                                component="img"
                                src={logo}
                                alt='CarMinds'
                            />
                        </Box>
                    </Box>

                    <Box className='navbar-pages'>
                        {
                            pages.map(page => (
                                <Button
                                    key={page}
                                    color='default'
                                    onClick={(e) => handlePages(e)}
                                >
                                    {page}
                                </Button>
                            ))
                        }
                    </Box>

                    {isAuthenticated ? (
                        <Box className='navbar-settings'>
                            <Tooltip title='Settings'>
                                <PersonIcon onClick={handleOpenUserMenu} />
                            </Tooltip>
                            <Menu
                                className='navbag-user-settings'
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                                disableAutoFocus
                            >
                                {
                                    settings.map(setting => (
                                        <MenuItem
                                            key={setting}
                                            onClick={(e) => handleCloseUserMenu(e)}
                                        >
                                            <Typography>{setting}</Typography>
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </Box>
                    ) : (
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={handleLoginStatus}
                        >
                            Log in
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;