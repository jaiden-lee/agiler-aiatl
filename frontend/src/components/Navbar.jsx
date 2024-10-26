import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../utils/context";
import { Button } from "@mantine/core";
import supabase from "../utils/supabase";

function Navbar() {
    const user = useContext(UserContext);
    const {project_id} = useParams();

    function handleLogout() {
        supabase.auth.signOut();
    }

    return (
        <nav className="flex justify-center items-center border-b-[1px]">
            <div className="flex gap-8 px-8 items-center py-4 w-full max-w-[80rem]">
                <Link to={user ? "/projects" : "/"} className="font-bold text-xl">agiler</Link>


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
                        (
                            project_id ?
                            <>
                                <Link to={`/projects/{project_id}/dashboard`}>Dashboard</Link>
                                <Link to={`/projects/{project_id}/documents`}>Documents</Link>
                                <Button className="text-white" radius={100} onClick={handleLogout}>Log Out</Button>
                            </> :
                            <Button className="text-white" radius={100} onClick={handleLogout}>Log Out</Button>
                        )
                        
                    }
                    
                </div>
            </div>
            
        </nav>
    );
}

export default Navbar;