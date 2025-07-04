import React, { useContext, useEffect, useState, } from "react";
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Box } from "@mui/material";
import AppContext from "../../state/AppContext";
import { jwtDecode } from "jwt-decode";
import { SERVER } from "../../config/global";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

function ProtectedAdminRoute() {
    const { auth } = useContext(AppContext);

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (auth.token) {
            setIsLoading(true);
            const userId = jwtDecode(auth.token).id;

            fetch(`${SERVER}/api/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.json().then((error) => {
                            throw new Error(error.message || 'Something went wrong!');
                        });
                    }
                })
                .then((data) => {
                    setUser(data.user);
                    auth.authStore.setUser(data.user);
                })
                .catch((error) => {
                    console.error(error.message);
                    auth.authStore.logout();
                    auth.setIsAuthenticated(false);
                    window.location.reload();
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            navigate('/');
        }
    }, []);

    if (isLoading || user === null) {
        return (
            <Box>
                <LoadingScreen />
            </Box>
        );
    }

    return user?.status === 'admin' ? <Outlet /> : <Navigate to='/' />
}

export default ProtectedAdminRoute;