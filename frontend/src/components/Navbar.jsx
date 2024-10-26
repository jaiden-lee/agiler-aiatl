import { Link, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../utils/context";
import { Button } from "@mantine/core";
import supabase from "../utils/supabase";

function Navbar() {
    const user = useContext(UserContext);

    function handleLogout() {
        supabase.auth.signOut();
    }

    return (
        <nav className="flex justify-center items-center">
            <div className="flex gap-8 px-8 items-center py-4 w-full max-w-[80rem]">
                <Link to={user ? "/dashboard" : "/"} className="font-bold text-lg">agiler</Link>


                <div className="ml-auto flex gap-8 items-center">
                    {
                        !user ?
                        <>
                            <Link to="/">About</Link>
                            <Link to="/">Contact</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">
                                <Button className="text-white" radius={100}>Sign Up</Button>
                            </Link>
                        </> :
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/documents">Documents</Link>
                            <Button className="text-white" radius={100} onClick={handleLogout}>Log Out</Button>
                        </>
                    }
                    
                </div>
            </div>
            
        </nav>
    );
}

export default Navbar;