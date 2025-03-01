import './Home.css';
import React, { useContext } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';

import '../Search/Search.jsx';
import Search from '../Search/Search.jsx';

function Home () {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();

    return (
        <div className='home-page'>
            <p>Home</p>
            <Search />
        </div>
    );
}

export default Home;