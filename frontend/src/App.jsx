import "./index.css"
import '@mantine/core/styles.css';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { MantineProvider } from '@mantine/core';
import { useState, useEffect } from "react";
import supabase from "./utils/supabase";
import { UserContext } from "./utils/context";
// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
// Components
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  
  
  // Keeps track of if user is logged in or not and has user data
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="inter">
      <UserContext.Provider value={user}>
        <MantineProvider>
          <BrowserRouter>
            <Navbar />

            <div className="px-8">
              <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
                <Route path="/dashboard" element={!user ? <Navigate to="/" /> : <Dashboard />} />
                <Route path="/documents" element={!user ? <Navigate to="/" /> : <Documents />} />
              </Routes>
            </div>
          </BrowserRouter>
      </MantineProvider>
     </UserContext.Provider>
    </div>
  );
}

export default App;