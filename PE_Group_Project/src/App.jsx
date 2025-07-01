import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Project from "./pages/Project";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement"; 

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={ <Home />} />
          <Route path="project" element={ <Project />} /> 
          <Route path="login" element={ <Login />} />
          <Route path="usermanagement" element={ <UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;