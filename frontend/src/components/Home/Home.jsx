import './Home.css';
import React, { useContext } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';


function Home () {
    const { isAuthenticated } = useContext(AppContext);
    const navigate = useNavigate();

    return (
        <div>
            <p>home</p>
        </div>
    );
}

export default Home;