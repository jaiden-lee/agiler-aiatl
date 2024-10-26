import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import supabase from '../utils/supabase';
import { useContext } from 'react';
import { UserContext } from '../utils/context';

function CreateProjectModal({ onProjectCreated }) { // Accept a prop to refresh project list
    const user = useContext(UserContext);
    const userId = user?.id;
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        initialValues: {
            projectTitle: '',
            projectDescription: '',
        },
        validate: {
            projectTitle: (value) => (value.length === 0 ? "Please enter a valid title" : null),
            projectDescription: (value) => (value.length === 0 ? "Please enter a valid description" : null),
        },
    });

    function closeModalNoSave() {
        form.reset();
        close();
    }

    async function create(values) {
        // Validate the form
        if (form.isValid()) {
            const { error } = await supabase.from("projects").insert({
                title: values.projectTitle,
                description: values.projectDescription,
                user_id: userId
            });

            if (error) {
                console.error('Error inserting project:', error);
            } else {
                // Optionally call onProjectCreated to refresh the project list
                if (onProjectCreated) {
                    onProjectCreated();
                }
                form.reset(); // Reset the form after successful creation
                close(); // Close the modal
            }
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={closeModalNoSave} title={"Add Project Details"} centered size="lg">
                <form onSubmit={form.onSubmit(create)} className="flex flex-col gap-4">
                    <TextInput
                        withAsterisk
                        label="Project Name"
                        placeholder="Enter project name"
                        {...form.getInputProps('projectTitle')}
                    />
                    <Textarea
                        withAsterisk
                        label="Project Description"
                        placeholder="Enter project description"
                        rows={5}
                        {...form.getInputProps('projectDescription')}
                    />
                    <Group justify="flex-end" gap="md" mt="md">
                        <Button type="submit"> Create</Button>
                        <Button variant="subtle" onClick={closeModalNoSave}>Discard</Button>
                    </Group>
                </form>
            </Modal>

            <button onClick={open} className="text-blue-text">Create New Project</button>
        </>
    );
}

export default CreateProjectModal;
