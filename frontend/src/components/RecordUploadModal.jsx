import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Textarea, Group } from '@mantine/core';
import { useField } from '@mantine/form';
import supabase from '../utils/supabase';

function RecordUploadModal() {
    const [opened, {open, close}] = useDisclosure(false);
    const field = useField({
        initialValue: ""
    });

    function handleSubmit() {
        close();
    }

    return (
        <>
            <Modal opened={opened} onClose={close} title={<h3 className="text-lg font-bold text-gray-text">Record/Upload Meeting</h3>} centered size="lg" padding={36}>
                <Textarea rows={8} {...field.getInputProps()} label="Enter in Meeting Notes" description="Hint: Any text entries can be uploaded here (i.e. messages)" />
                <h4 className="font-medium text-sm text-center my-6">OR</h4>
                <div>
                    <h4 className="font-semibold mb-4">Attach a Recording</h4>
                    <Button fullWidth>Record</Button>
                </div>
                <Group justify='center' className="mt-12">
                    <Button radius={100} variant="outline" onClick={handleSubmit}>Submit</Button>
                </Group>
            </Modal>

            <Button className="text-white ml-auto" radius={25} onClick={open}>Record/Upload Meeting</Button>
        </>
    );
}

export default RecordUploadModal;