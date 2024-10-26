import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import { MantineProvider } from '@mantine/core';
// Pages
import Home from "./pages/Home";
// Components
import Navbar from "./components/Navbar";

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />}/>
      </Routes>
    </BrowserRouter>
    </MantineProvider>
  );
}

export default App;