import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Textarea, Group, FileInput } from '@mantine/core';
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
                <div className='flex items-baseline'>
                    <h4 className="font-semibold mb-4 pr-2">Attach a Recording</h4>
                    <h5 className='text-gray-text' style={{ fontSize: '0.8rem' }}>Or, are you in a meeting now? Click record.</h5>
                </div>
                
                <div className="flex items-center space-x-2">
                    <FileInput
                        variant="filled"
                        placeholder=""
                        className="flex-grow"
                        styles={{input: { border: '1px solid black',},}}
                    />
                    <Button className="w-auto px-4 py-2 text-sm">Record</Button> {/* Adjust padding for size */}
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