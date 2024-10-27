import { useState, useEffect, useContext } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";
import { UserContext } from "../utils/context";
import EditProjectDescriptionModal from "../components/EditProjectDescriptionModal";
import { Skeleton, Accordion } from "@mantine/core";
import RecordUploadModal from "../components/RecordUploadModal";
import CreateUserStoryModal from "../components/CreateUserStoryModal";

function Dashboard() {
    const {project_id} = useParams();
    const user = useContext(UserContext);
    const userId = user?.id || "";
    
    const [projectInfo, setProjectInfo] = useState({
        title: null,
        description: null
    });
    const [userStories, setUserStories] = useState(null);
    // const [tasks, setTasks] = useState(null);
    const [hasPermission, setHasPermission] = useState(true);
    const [refreshToggle, setRefreshToggle] = useState(false);
    
    useEffect(() => {
        if (refreshToggle == true) {
            setRefreshToggle(false);
        }
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
                    const [
                        {data: stories_data, error: stories_error}, 
                        {data: tasks_data, error: tasks_error}
                    ] = await Promise.all([
                        supabase.from("user_stories").select("id, title, story, points").eq("project_id", project_id),
                        supabase.rpc("fetch_project_tasks", {
                            p_project_id: project_id
                        })
                    ]);
                    if (!stories_data || !tasks_data) {
                        setProjectInfo({
                            title: "Failed to load",
                            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        });
                        setUserStories([]);
                        // setTasks([]);
                    } else {
                        const storyToTaskMap = {};
                        const userStories = stories_data.map((user_story) => {
                            storyToTaskMap[user_story.id] = []
                            return {
                                story_id: user_story.id,
                                story: user_story.story,
                                title: user_story.title,
                                points: user_story.points,
                                tasks: storyToTaskMap[user_story.id]
                            }
                        })
                        for (let task of tasks_data) {
                            const story_id = task.story_id;
                            storyToTaskMap[story_id].push(task);
                        }
                        setUserStories(userStories);
                        console.log(userStories);
                    }
                }
            }
        }
        if (user) {
            fetchProjectData();
        }
    }, [supabase, user, userId, refreshToggle]);

    


    if (!hasPermission) {
        return <Navigate to="/projects" />
    }

    let userStoryComponents = [];
    if (userStories) {
        userStoryComponents = userStories.map((user_story) => {
            const taskComponents = user_story.tasks.map((task) => {
                const taskDependenciesString = (task.dependencies.length == 0 ? "None" : task.dependencies.join(", "));
                const statusComponent = task.status == "0" ? <p className="p-2 bg-gray-unfinished rounded-md">To Do</p> : (task.status=="1" ? <p className="p-2 bg-yellow-in-progress rounded-md">In Progress</p> : <p className="p-2 bg-green-completed rounded-md">Done</p>)
                return (
                    <tr key={task.task_id}>
                        <td className="border-[1px] rounded-md p-2 px-4">{task.name}</td>
                        <td className="border-[1px] rounded-md p-2 px-4">{task.task_id}</td>
                        <td className="border-[1px] rounded-md p-2 px-4">{taskDependenciesString}</td>
                        <td className="border-[1px] rounded-md p-2 px-4">{task.difficulty}</td>
                        <td className="border-[1px] rounded-md p-2 px-4">{task.priority}</td>
                        <td className="border-[1px] rounded-md p-2 px-4 text-[rgb(0,0,0,.5)]">{statusComponent}</td>
                    </tr>
                )
            })
            return (
                <Accordion.Item key={user_story.story_id} value={user_story.title} >
                    <Accordion.Control>
                        <h3 className="font-semibold">
                            {user_story.title} | Story Points: {user_story.points}
                        </h3>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <div className="flex flex-col gap-4 p-4 py-6">
                            <h4 className="text-gray-text"><span className="font-semibold">User Story: </span>{user_story.story}</h4>
                            <table className="text-left mt-4">
                                <thead>
                                    <tr className="text-gray-text font-medium">
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[35%] font-medium">Task Name</th>
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[10%] font-medium">ID</th>
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[15%] font-medium">Dependencies</th>
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[15%] font-medium">Difficulty</th>
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[10%] font-medium">Priority</th>
                                        <th className="border-[1px] rounded-md p-2 px-4 w-[15%] font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taskComponents}
                                </tbody>
                            </table>
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>
          );  
        })
    }

    return (
        <div className='flex justify-center items-center'>
            <div className="flex flex-col gap-20 py-12 max-w-[76rem] w-full">
                {/* Info */}
                {
                    projectInfo.title ?
                    <div className="flex flex-col w-full gap-6">
                        <h1 className="text-2xl font-semibold text-orange-primary">{projectInfo.title}</h1>
                        <p>{projectInfo.description}</p>
                        <div className="mt-2 flex gap-6">
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
                            <h2 className="text-xl font-semibold">🚀 Progress Overview</h2>
                            <div className="ml-auto flex gap-4">
                                <CreateUserStoryModal project_id={project_id} setRefreshToggle={setRefreshToggle} />
                                <RecordUploadModal />
                            </div>
                        </div>
                        <Accordion variant="contained" className="mt-8">
                            {userStoryComponents}
                        </Accordion>
                    </div> :
                    <div>
                        <Skeleton height={'15rem'} radius="md" />
                        <Skeleton height={'15rem'} mt={6} radius="md" />
                    </div>
                }
            </div>
        </div>
    );
}

export default Dashboard;