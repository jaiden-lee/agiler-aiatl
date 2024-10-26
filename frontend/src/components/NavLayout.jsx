import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function NavLayout() {
    return (
        <div className="inter">
            <Navbar />
            <div className="px-8">
                <Outlet />
            </div>
        </div>
    );
}

export default NavLayout;