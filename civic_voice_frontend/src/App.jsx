import { useState } from 'react'
import NavBar from './components/navBar';
import NavBarHome from './components/navBarHome.jsx'
import Register from './components/register';
import Login from './components/login';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet } from 'react-router-dom';
import Location from './components/geoLocation.jsx';

function App() {
  return (
    <>
    <Register />
    <Outlet />
    </>
    );
}
//  navBarTab = {navBarTab} setNavBarTab = {setNavBarTab}
export default App;