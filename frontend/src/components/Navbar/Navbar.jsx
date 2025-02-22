import './Navbar.css'
import React, { useContext, useEffect } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
    const { isAuthenticated } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        // console.log(isAuthenticated);
    }, [isAuthenticated]);

    function handleLoginStatus() {
        if (isAuthenticated) {
            navigate('/profile');
        }
        else {
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
                            {isAuthenticated ? "Your account" : "Log in"}
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Navbar;