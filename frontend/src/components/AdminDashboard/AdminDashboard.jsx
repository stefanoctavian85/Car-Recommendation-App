import './AdminDashboard.css';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { Box, Typography, Stack, createTheme } from '@mui/material';
import { SERVER } from '../../config/global.jsx';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { AppProvider } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from 'jwt-decode';
import Logo from '../../assets/LogoDashboard.svg';
import PersonIcon from '@mui/icons-material/Person';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';
import Logs from '../Logs/Logs.jsx';
import Dashboard from '../Dashboard/Dashboard.jsx';
import ChatIcon from '@mui/icons-material/Chat';
import AdminConversations from '../AdminConversations/AdminConversations.jsx';
import Ticket from '../Ticket/Ticket.jsx';

const NAVIGATION = [
    {
        kind: 'header',
        title: 'Main items',
    },
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />
    },
    {
        segment: 'logs',
        title: 'Logs',
        icon: <ShoppingCartIcon />
    },
    {
        segment: 'tickets',
        title: 'Tickets',
        icon: <ChatIcon />
    }
];

const theme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 600,
          lg: 1200,
          xl: 1536,
        },
      },
});

function CustomAppTitle() {
    return (
        <Stack>
            <Box
                component={Link}
                to='/'
            >
                <Box
                    className='navbar-dashboard-logo'
                    component="img"
                    src={Logo}
                    alt='CarMinds'
                />
            </Box>
        </Stack>
    );
}

function SidebarFooterAccount() {
    const { auth } = useContext(AppContext);

    const [user, setUser] = useState({});

    useEffect(() => {
        if (auth.authStore.getUser()) {
            setUser(auth.authStore.getUser());
        } else if (auth.authStore.token) {
            const userId = jwtDecode(auth.authStore.token).id;
            fetch(`${SERVER}/api/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setUser(data.user);
                    auth.authStore.setUser(data.user);
                })
        } else {
            navigate('/');
        }
    }, []);


    return (
        <Box className='sidebar-footer'>
            <Box className='sidebar-icon'>
                <PersonIcon className='sidebar-person-icon' />
            </Box>
            <Box className='sidebar-account'>
                <Typography className='sidebar-account-name'>{user.firstname} {user.lastname}</Typography>
                <Typography className='sidebar-account-email'>{user.email}</Typography>
            </Box>
        </Box>
    );
}

function PageContent({ pathname, router, state }) {
    return (
        <Box className='page-content' sx={{
            bgcolor: 'background.default',
            minHeight: '100vh'
        }}>
            {
                pathname === '/logs' ? <Logs /> : null
            }

            {
                pathname === '/dashboard' ? <Dashboard /> : null
            }

            {
                pathname === '/tickets' ? <AdminConversations router={router} /> : null
            }

            {
                pathname === '/solve-conversation' ? <Ticket state={state} router={router} /> : null
            }
        </Box>
    );
}

function AdminDashboard() {
    const { auth } = useContext(AppContext);

    const [user, setUser] = useState({});

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const [pathname, setPathname] = useState('/dashboard');
    const [state, setState] = useState(null);

    const router = useMemo(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path, options) => {
                setPathname(String(path));
                if (options && options.state) {
                    setState(options.state);
                } else {
                    setState(null);
                }
            }
        }
    }, [pathname]);

    useEffect(() => {
        setIsLoading(true);

        if (auth.authStore.getUser()) {
            setUser(auth.authStore.getUser());
        } else if (auth.authStore.token) {
            const userId = jwtDecode(auth.authStore.token).id;
            fetch(`${SERVER}/api/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    setUser(data.user);
                    auth.authStore.setUser(data.user);
                })
        } else {
            navigate('/');
        }
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, []);

    if (isLoading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={theme}
        >
            <DashboardLayout
                slots={{
                    appTitle: CustomAppTitle,
                    sidebarFooter: SidebarFooterAccount
                }}
            >
                <PageContent pathname={pathname} router={router} state={state}/>
            </DashboardLayout>
        </AppProvider>
    );
}

export default AdminDashboard;