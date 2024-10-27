import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Textarea, Group, FileInput, LoadingOverlay } from '@mantine/core';
import React, { useState, useRef, useContext } from 'react';
import { UserContext } from "../utils/context";
import { useParams } from 'react-router-dom';
import axios from "axios";

function RecordUploadModal(props) {
  const {setRefreshToggle} = props;
  const user = useContext(UserContext);
  const userId = user?.id
  const [opened, { open, close }] = useDisclosure(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState(null); // State for the recorded audio file
  const [audioUrl, setAudioUrl] = useState(null); // State for the audio Blob URL
  const [textInput, setTextInput] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const {project_id} = useParams();

  const [isLoading, setIsLoading] = useState(false);

  const handleRecord = async () => {
    if (!isRecording) {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'meeting_recording.mp3', { type: 'audio/mp3' });
        setRecordedFile(file); // Save the file to state

        // Create a Blob URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url); // Set the Blob URL for audio playback

        audioChunks.current = []; // Clear the chunks
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } else {
      // Stop recording
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };


  const handleClose = () => {
    close();
    setIsRecording(false);
    setRecordedFile(null);
    setAudioUrl(null);
    setTextInput("");
  };

  async function handleSubmit() {
    const formData = new FormData();
    

    formData.append('project_id', project_id)
    setIsLoading(true);
    if (recordedFile) {
        formData.append('audio', recordedFile);
        const res = await axios.post("http://localhost:8000/upload-audio", formData);
        
    }else {
        formData.append('text', textInput);
        const res = await axios.post("http://localhost:8000/upload-text", formData);
    }
    setIsLoading(false);
    handleClose();
    setRefreshToggle(true);
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={<span className="text-lg font-bold text-gray-text">Record/Upload Meeting</span>}
        centered
        size="lg"
        padding={36}
      >
        <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Textarea
          rows={8}
          label="Enter in Meeting Notes"
          description="Hint: Any text entries can be uploaded here (i.e. messages)"
          disabled={recordedFile !== null} // Disable if a file is uploaded
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <h4 className="font-medium text-sm text-center my-6">OR</h4>
        
        <div className="flex items-baseline">
          <h4 className="font-semibold mb-4 pr-2">Attach a Recording</h4>
          <h5 className="text-gray-text" style={{ fontSize: '0.8rem' }}>
            Or, are you in a meeting now? Click record.
          </h5>
        </div>

        <div className="flex items-center space-x-2">
          <FileInput
            variant="filled"
            placeholder="Attach a .mp3 recording of your meeting"
            className="flex-grow"
            styles={{ input: { border: '1px solid black' } }}
            accept=".mp3"
            value={recordedFile}
            onChange={(file) => {
              if (file && file.type !== 'audio/mp3') {
                alert('Please upload a file in .mp3 format.');
                setRecordedFile(null);
              } else {
                setRecordedFile(file);
                setTextInput("");
              }
            }}
          />
          <Button 
            className="w-auto px-4 py-2 text-sm" 
            onClick={handleRecord}
            color={isRecording ? 'red' : 'blue'} // Change color to red if recording
          >
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        </div>

        {/* Audio Player for Playback */}
        {audioUrl && (
          <div className="mt-4">
            <h5 className="font-semibold">Playback Recorded Audio:</h5>
            <audio controls src={audioUrl} className="w-full mt-2" />
          </div>
        )}

        <Group justify="center" className="mt-12">
          <Button radius={100} variant="outline" onClick={handleSubmit}>
            Submit
          </Button>
        </Group>
      </Modal>

      <Button className="text-white" radius={25} onClick={open}>
        Record/Upload Meeting
      </Button>
    </>
  );
}

export default RecordUploadModal;
