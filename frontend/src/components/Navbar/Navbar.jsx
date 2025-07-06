import './Navbar.css';
import { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Container, Toolbar, Box, Button, Menu, MenuItem, Typography, Tooltip, List, ListItem } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Logo from '../../assets/Logo.svg';

const pages = ['Search', 'Recommendation'];
const settings = ['Profile', 'Log out'];

function Navbar() {
    const { auth } = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const navigate = useNavigate();
    const menuAnchorRef = useRef(null);

    useEffect(() => {
        setIsAuthenticated(auth.isAuthenticated);
    }, [auth.isAuthenticated]);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(menuAnchorRef.current);
    }

    const handleCloseUserMenu = (event) => {
        setAnchorElUser(null);

        if (menuAnchorRef.current) {
            menuAnchorRef.current.focus();
        }

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
            if (event.target.textContent === "Recommendation") {
                navigate('/recommendation');
            } else if (event.target.textContent === "Search") {
                navigate('/search');
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
                                src={Logo}
                                alt='CarMinds'
                            />
                        </Box>
                    </Box>

                    <Box className='navbar-pages'>
                        <List className='navbar-pages'>
                            {
                                pages.map((page, index) => (
                                    <ListItem
                                        key={index}
                                        onClick={(e) => handlePages(e)}
                                    >
                                        <Button
                                            variant='default'
                                            className='navbar-button'
                                        >
                                            {page}
                                        </Button>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </Box>

                    {isAuthenticated ? (
                        <Box className='navbar-settings'>
                            <Tooltip title='Settings'>
                                <Box
                                    ref={menuAnchorRef}
                                    onClick={handleOpenUserMenu}
                                    tabIndex={0}
                                >
                                    <PersonIcon />
                                </Box>
                            </Tooltip>

                            <Menu
                                className='navbar-user-settings'
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
                        <Box className='navbar-settings'>
                            <Button
                                className='navbar-login-button'
                                onClick={handleLoginStatus}
                            >
                                Log in
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;