import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/index.jsx';
import Navbar from './components/Navbar/index.jsx';
import Login from './components/Login/index.jsx';
import Register from './components/Register/index.jsx';
import Profile from './components/Profile/index.jsx';
import ProtectedRoute from './components/ProtectedRoute/index.jsx';

import AppContext from './state/AppContext.jsx';
import AuthStore from './state/stores/AuthStore.jsx';

function App() {
  const [authStore] = useState(new AuthStore());
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.getAuthStatus());

  useEffect(() => {
    authStore.checkAuthStatus();
    setIsAuthenticated(authStore.getAuthStatus());
  }, [authStore]);

  return (
    <div className='App'>
      <AppContext.Provider value={{
        auth: authStore,
        isAuthenticated,
        setIsAuthenticated
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
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </div>
  );
}

export default App;
