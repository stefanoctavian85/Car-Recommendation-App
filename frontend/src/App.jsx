import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Profile from './components/Profile/Profile.jsx';
import Form from './components/Form/Form.jsx';
import CarDetails from './components/CarDetails/CarDetails.jsx';

import AppContext from './state/AppContext.jsx';
import AuthStore from './state/stores/AuthStore.jsx';
import CarsStore from './state/stores/CarsStore.jsx';

function App() {
  const [authStore] = useState(new AuthStore());
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.getAuthStatus());
  const [token, setToken] = useState(authStore.getToken());
  const [carsStore] = useState(new CarsStore());
  const [cars, setCars] = useState(carsStore.getCars());

  useEffect(() => {
    authStore.checkAuthStatus();
    setIsAuthenticated(authStore.getAuthStatus());
    setToken(authStore.getToken());
  }, [authStore]);

  useEffect(() => {
    setCars(carsStore.getCars());
  }, [carsStore]);

  return (
    <div className='App'>
      <AppContext.Provider value={{
        auth: {
          authStore,
          isAuthenticated,
          setIsAuthenticated,
          token,
          setToken,
        },
        cars: {
          carsStore,
          setCars,
        }
      }}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/register' element={<Register />}></Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/profile' element={<Profile />}></Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/form' element={<Form />}></Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/car-details' element={<CarDetails />}></Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </div>
  );
}

export default App;
