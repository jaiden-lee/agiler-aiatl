import { useState, useEffect, useContext } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";
import { UserContext } from "../utils/context";

function Dashboard() {
    const {project_id} = useParams;
    const user = useContext(UserContext);
    const userId = user?.id || "";
    const [projectInfo, setProjectInfo] = useState({
        title: "Shopping Cart Feature",
        description: "The Shopping Cart Feature is designed to deliver a seamless and intuitive shopping experience. It enables users to effortlessly add, edit, and remove items, providing clear visibility of their selections and costs. By streamlining the checkout process and reducing friction points, this feature aims to enhance user satisfaction, increase conversions, and offer a flexible framework for integrating payment gateways and promotional offers."
    });
    const [userStories, setUserStories] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        async function fetchProjectData() {
            const {data, error} = await supabase.from("projects").select("title, description").eq("project_id", project_id).eq("user_id", userId);
            if (!data) {
                setProjectInfo({
                    title: "Failed to load",
                    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                })
            } else {
                if (data.length == 0) {
                    setHasPermission(false);
                } else {
                    const projectData = data[0];
                    setProjectInfo({
                        title: projectData.title,
                        description: projectData.description
                    });
                }
            }
        }
    }, [supabase]);

    


    if (!hasPermission) {
        return <Navigate to="/projects" />
    }

    return (
        <div className='flex justify-center items-center'>
            <div className="flex flex-col gap-12 py-12 max-w-[76rem] w-full">
                {/* Info */}
                {
                    projectInfo.title &&
                    <div className="flex flex-col w-full gap-6">
                        <h1 className="text-2xl font-semibold">{projectInfo.title}</h1>
                        <p>{projectInfo.description}</p>
                        <div className="mt-6 flex gap-6">
                            <Link to="/projects" className="text-blue-text">Switch Project</Link>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default Dashboard;