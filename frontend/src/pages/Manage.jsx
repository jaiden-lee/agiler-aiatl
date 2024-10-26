import { Grid, Card, Button, Group, TextInput } from '@mantine/core';
import { useEffect, useState, useContext } from 'react';
import supabase from "../utils/supabase";
import { UserContext } from "../utils/context";
import CreateProjectModal from '../components/CreateProjectModal';
import { useNavigate, Link } from 'react-router-dom';

function Manage() {
    const user = useContext(UserContext);
    const userId = user?.id;
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    // Define fetchProjects outside of useEffect
    const fetchProjects = async () => {
        if (!userId) return; // Ensure userId is available
        try {
            const { data, error } = await supabase
                .from('projects')
                .select()
                .eq("user_id", userId);

            if (error) {
                throw error;
            }

            setProjects(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProjects(); // Call fetchProjects when user changes
    }, [user, userId]);

    const handleViewProject = (projectId) => {
        navigate(`/projects/${projectId}/dashboard`);
    };

    const projectComponents = projects.map((project, index) => {
        const colorIndex = index%3;
        const bgColor = colorIndex == 0 ? "bg-orange-background" : (colorIndex == 1 ? "bg-yellow-background" : "bg-pink-background");
        const textColor = colorIndex == 0 ? "text-orange-primary" : (colorIndex == 1 ? "text-yellow-primary" : "text-pink-primary");

        return (
        <div className={`aspect-square flex flex-col gap-4 shadow-md rounded-xl p-8 ${bgColor}`} key={project.project_id}>
            <p className={`text-xl font-medium ${textColor} text-nowrap overflow-clip`}>
                {project.title}
            </p>
            
            <p className="overflow-clip gap-2 max-h-[calc(100%-8rem)] text-[rgb(0,0,0,.5)]">
                {project.description}
            </p>

            <Button className="bg-primary-orange mt-auto" color={colorIndex == 0 ? "orange" : (colorIndex == 1 ? "yellow" : "pink")} radius={100} onClick={() => handleViewProject(project.project_id)}>View Project</Button>
        </div>
        )})

    return (
        <div className="p-4">
            <h1 className="text-left text-3xl font-bold pt-10">Current Projects</h1>
            <div className='flex space-x-4 gap-4 py-2'>
                <div className='flex items-center pb-4 pt-2 text-blue-text'>
                    <CreateProjectModal onProjectCreated={fetchProjects} /> {/* Pass the function here */}
                </div>
                <p className='flex items-center pb-4 pt-2 text-gray-text'>Manage Existing Projects</p>
                <p className='flex items-center pb-4 pt-2 text-gray-text'>View Archived Projects</p>
                <p className='flex items-center pb-4 pt-2 text-gray-text'>Sort</p>
            </div>
            
            {projects.length === 0 ? (
                <p size="lg" color="dimmed" className="text-center pt-2">
                    There are no projects, create a new project to get started.
                </p>
            ): (
                <div className="w-full grid grid-cols-4 gap-6">
                    {projectComponents}
                </div>
            )}
            
        </div>
        
    );
}

export default Manage;
