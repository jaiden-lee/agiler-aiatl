import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import supabase from '../utils/supabase';

function EditProjectDescriptionModal(props) {
    const {title, description, project_id} = props;
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        mode: 'controlled',
        initialValues: {
          projectTitle: title,
          projectDescription: description,
        },
    
        validate: {
          projectTitle: (value) => (value.length == 0 ? "Please enter a valid title" : null),
          projectDescription: (value) => (value.length == 0 ? "Please enter a valid description" : null)
        },
      });

    function closeModalNoSave() {
        form.reset();
        close();
    }

    async function saveChanges(values) {
        if (form.isValid) {
            form.setInitialValues(values);
            const data = await supabase.from("projects").update({
                title: values.projectTitle,
                description: values.projectDescription
            }).eq("project_id", project_id);
            form.reset();
            close();
        }
        
    }

    return (
        <>
            <Modal opened={opened} onClose={closeModalNoSave} title={"Edit Project Details"} centered size="lg">
                <form onSubmit={form.onSubmit(saveChanges)} className="flex flex-col gap-4">
                    <TextInput
                        withAsterisk
                        label="Project Name"
                        placeholder="Enter project name"
                        key={form.key('projectTitle')}
                        {...form.getInputProps('projectTitle')}
                    />

                    <Textarea
                        withAsterisk
                        label="Project Description"
                        placeholder="Enter project description"
                        key={form.key('projectDescription')}
                        rows={5}
                        {...form.getInputProps('projectDescription')}
                    />

                    <Group justify="flex-end" gap="md" mt="md">
                        <Button type="submit">Save Changes</Button>
                        <Button variant="subtle" onClick={closeModalNoSave}>Discard</Button>
                    </Group>
                </form>
            </Modal>

            <button onClick={open} className="text-gray-text">Edit Project Details</button>
        </>
    );
}

export default EditProjectDescriptionModal;