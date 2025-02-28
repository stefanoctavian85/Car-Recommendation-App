import './Navbar.css'
import React, { useContext, useEffect } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated]);

    function handleLoginStatus() {
        if (auth.isAuthenticated) {
            navigate('/profile');
        }
        else {
            navigate('/login');
        }
    }

    function logout() {
        auth.authStore.logout();
        auth.setIsAuthenticated(false);
        navigate("/");
    }

    function completeForm() {
        if (auth.isAuthenticated) {
            navigate('/form');
        } else {
            navigate('/login');
        }
    }

    return (
        <header className='main-header'>
            <nav className='navbar'>
                <div className='navbar-logo'>
                    <Link to="/">CarMinds</Link>
                </div>
                <ul className='navbar-links'>
                    <li>
                        <button
                            className='navbar-button-login'
                            onClick={handleLoginStatus}
                        >
                            {auth.isAuthenticated ? "Your account" : "Log in"}
                        </button>
                        <button
                            className='navbar-button-logout'
                            onClick={logout}
                        >
                            Log out
                        </button>
                        <button
                            className='navbar-form'
                            onClick={completeForm}
                        >
                            Form
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Navbar;