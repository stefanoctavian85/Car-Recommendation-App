import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/index.jsx';
import Login from './components/Login/index.jsx';
import Register from './components/Register/index.jsx';
import Profile from './components/Profile/index.jsx';
import ProtectedRoute from './components/ProtectedRoute/index.jsx';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>

          <Route element={<ProtectedRoute />}>
            <Route path='/profile' element={<Profile />}></Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
