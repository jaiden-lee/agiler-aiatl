import { useState, useEffect, useContext } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";
import { UserContext } from "../utils/context";
import EditProjectDescriptionModal from "../components/EditProjectDescriptionModal";
import { Skeleton, Button } from "@mantine/core";
import RecordUploadModal from "../components/RecordUploadModal";

function Dashboard() {
    const {project_id} = useParams();
    const user = useContext(UserContext);
    const userId = user?.id || "";
    console.log(userId);
    
    const [projectInfo, setProjectInfo] = useState({
        title: null,
        description: null
    });
    const [userStories, setUserStories] = useState([]);
    const [tasks, setTasks] = useState(null);
    const [hasPermission, setHasPermission] = useState(true);
    
    useEffect(() => {
        async function fetchProjectData() {
            const {data, error} = await supabase.from("projects").select("title, description").eq("project_id", project_id).eq("user_id", userId);
            console.log(error);
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
        if (user) {
            fetchProjectData();
        }
    }, [supabase, user, userId]);

    


    if (!hasPermission) {
        return <Navigate to="/projects" />
    }

    return (
        <div className='flex justify-center items-center'>
            <div className="flex flex-col gap-12 py-12 max-w-[76rem] w-full">
                {/* Info */}
                {
                    projectInfo.title ?
                    <div className="flex flex-col w-full gap-6">
                        <h1 className="text-2xl font-semibold">{projectInfo.title}</h1>
                        <p>{projectInfo.description}</p>
                        <div className="mt-6 flex gap-6">
                            <Link to="/projects" className="text-blue-text">Switch Project</Link>
                            <EditProjectDescriptionModal title={projectInfo.title} description={projectInfo.description} project_id={project_id} />
                        </div>
                    </div>
                    :
                    <div>
                         <Skeleton height={24} width="70%" radius="xl" />
                         <Skeleton height={12} mt={36} radius="xl" />
                         <Skeleton height={12} mt={6} radius="xl" />
                         <Skeleton height={12} mt={6} radius="xl" />
                         <Skeleton height={12} mt={6} width="60%" radius="xl" />
                    </div>
                }

                {/* Overview */}
                {
                    userStories ? 
                    <div>
                        <div className="flex gap-4">
                            <h2 className="text-xl font-semibold">Project Overview</h2>
                            <RecordUploadModal />
                        </div>

                    </div> :
                    <div>

                    </div>
                }
            </div>
        </div>
    );
}

export default Dashboard;