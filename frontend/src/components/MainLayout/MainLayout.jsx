import React from "react";
import Navbar from "../Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}

export default MainLayout;