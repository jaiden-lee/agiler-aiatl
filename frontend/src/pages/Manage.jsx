import { Grid, Card, Button, Group, TextInput } from '@mantine/core';
import { useEffect, useState, useContext } from 'react';
import supabase from "../utils/supabase";
import { UserContext } from "../utils/context";
import CreateProjectModal from '../components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import { callGeminiFunction } from '../components/GeminiAPI';

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

    return (
        <div className="p-4">
            <h1 className="text-left text-3xl font-bold pt-10">Current Projects</h1>
            <div className='flex space-x-4'>
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
                <Grid gutter="md">
                    {projects.map((project) => (
                        <Grid.Col key={project.project_id} span={3}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder className="w-64 h-64 flex flex-col">
                            <div className="flex-grow">
                                <p className="text-xl font-bold">
                                    {project.title}
                                </p>
                                <hr className="border-t-2 border-gray-300" />
                    
                                <div style={{ maxHeight: '9rem', overflowY: 'auto' }} className="mb-1">
                                    <p
                                        className="mb-4 pt-2 pb-1"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 6,
                                        }}
                                    >
                                        {project.description}
                                    </p>
                                </div>
                            </div>
                    
                            <Button variant="dark" color="blue" fullWidth onClick={() => handleViewProject(project.project_id)}>
                                View Project
                            </Button>
                        </Card>
                    </Grid.Col>                    
                    ))}
                </Grid>
            )}
            
        </div>
        
    );
}

export default Manage;
