import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import Home from './components/Home/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute/ProtectedAdminRoute.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Search from './components/Search/Search.jsx';
import Profile from './components/Profile/Profile.jsx';
import Form from './components/Form/Form.jsx';
import Cars from './components/Cars/Cars.jsx';
import CarDetails from './components/CarDetails/CarDetails.jsx';
import RentCar from './components/RentCar/RentCar.jsx';
import AppContext from './state/AppContext.jsx';
import AuthStore from './state/stores/AuthStore.jsx';
import CarsStore from './state/stores/CarsStore.jsx';
import AdminDashboard from './components/AdminDashboard/AdminDashboard.jsx';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';
import RentConfirmation from './components/RentConfirmation/RentConfirmation.jsx';

function App() {
  const [authStore] = useState(new AuthStore());
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.getAuthStatus());
  const [token, setToken] = useState(authStore.getToken());
  const [carsStore] = useState(new CarsStore());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = JSON.parse(localStorage.getItem("token"));
    
    if (storedToken) {
      authStore.checkAuthStatus();
      setIsAuthenticated(authStore.getAuthStatus());
      setToken(storedToken);
    } else {
      setIsAuthenticated(false);
      setToken('');
    }

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <Box>
        <LoadingScreen />
      </Box>
    );
  }

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
        }
      }}>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedAdminRoute />}>
              <Route path='/dashboard' element={<AdminDashboard />}></Route>
            </Route>

            <Route element={<MainLayout />}>
              <Route path='/' element={<Home />}></Route>
              <Route path='/login' element={<Login />}></Route>
              <Route path='/register' element={<Register />}></Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/search' element={<Search />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/profile' element={<Profile />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/form' element={<Form />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/cars' element={<Cars />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/car-details' element={<CarDetails />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/rent-car' element={<RentCar />}></Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/rent-confirmation' element={<RentConfirmation />}></Route>
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </div>
  );
}

export default App;
