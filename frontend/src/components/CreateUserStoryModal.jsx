import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import supabase from '../utils/supabase';

function CreateUserStoryModal(props) {
    const {project_id, setRefreshToggle} = props;
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        mode: 'controlled',
        initialValues: {
            title: "",
            story: "",
            points: ""
        },
    
        validate: {
          title: (value) => (value.length == 0 ? "Please enter a valid title" : null),
          story: (value) => (value.length == 0 ? "Please enter a valid user story" : null),
          points: (value) => (isNaN(Number(value)) || value=="" ? "Enter a valid number" : null)
        },
      });

    function closeModalNoSave() {
        form.reset();
        close();
    }

    async function saveChanges(values) {
        if (form.isValid) {
            await supabase.from("user_stories").insert({
                title: values.title,
                story: values.story,
                project_id: project_id,
                points: values.points
            });
            setRefreshToggle(true);
            form.reset();
            close();
        }
        
    }

    return (
        <>
            <Modal opened={opened} onClose={closeModalNoSave} title={"Create User Story"} centered size="lg">
                <form onSubmit={form.onSubmit(saveChanges)} className="flex flex-col gap-4">
                    <TextInput
                        withAsterisk
                        label="Title"
                        placeholder="Enter a title for this user story"
                        key={form.key('title')}
                        {...form.getInputProps('title')}
                    />

                    <Textarea
                        withAsterisk
                        label="User Story"
                        placeholder="i.e. As a user, I want to..."
                        key={form.key('story')}
                        rows={3}
                        {...form.getInputProps('story')}
                    />
                    
                    <TextInput
                        withAsterisk
                        label="Story Points"
                        placeholder="i.e., 8"
                        key={form.key('points')}
                        {...form.getInputProps('points')}
                    />

                    <Group justify="flex-end" gap="md" mt="md">
                        <Button type="submit">Save Changes</Button>
                        <Button variant="subtle" onClick={closeModalNoSave}>Discard</Button>
                    </Group>
                </form>
            </Modal>

            <Button onClick={open} variant="light" radius={100}>Create User Story</Button>
        </>
    );
}

export default CreateUserStoryModal;