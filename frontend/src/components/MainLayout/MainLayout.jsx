import { useContext } from "react";
import Navbar from "../Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";
import Chat from '../Chat/Chat.jsx';
import AppContext from "../../state/AppContext.jsx";

function MainLayout() {
    const { auth } = useContext(AppContext);

    return (
        <>
            <Navbar />
            <Outlet />
            {
                auth.token && auth.authStore.user.status === 'regular' ? (
                    <>
                        <Chat />
                    </>
                ) : null
            }
        </>
    );
}

export default MainLayout;