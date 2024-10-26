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
import Manage from "./pages/Manage";
// Components
import Navbar from "./components/Navbar";
import NavLayout from "./components/NavLayout";

function App() {
  const [user, setUser] = useState(null);
  const [canRedirect, setCanRedirect] = useState(false);
  
  
  // Keeps track of if user is logged in or not and has user data
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!canRedirect) {
        setCanRedirect(true);
      }
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
      <UserContext.Provider value={user}>
        <MantineProvider>
          <BrowserRouter>

              <Routes>
                <Route element={<NavLayout />}>
                  <Route path="/" element={(user && canRedirect) ? <Navigate to="/projects" /> : <Home />} />
                  <Route path="/login" element={(user && canRedirect) ? <Navigate to="/projects" /> : <Login />} />
                  <Route path="/signup" element={(user && canRedirect) ? <Navigate to="/projects" /> : <Signup />} />
                  <Route path="/projects/:project_id/dashboard" element={(!user && canRedirect) ? <Navigate to="/" /> : <Dashboard />} />
                  <Route path="/projects/:project_id/documents" element={(!user && canRedirect) ? <Navigate to="/" /> : <Documents />} />
                  <Route path="/projects" element={(!user && canRedirect) ? <Navigate to="/" /> : <Manage />} />
                </Route>
                
              </Routes>
          </BrowserRouter>
      </MantineProvider>
     </UserContext.Provider>
  );
}

export default App;