import { NavLink } from "react-router-dom";

function Header(){
    return(
        <header className="bg-blue-700 text-white p-4 text-xl font-bold flex items-center justify-between">
            <span>TaskIO</span>
            <nav>
                <NavLink to="/" className="mr-4 hover:underline">Home</NavLink>
                <NavLink to="/project" className="mr-4 hover:underline">Project</NavLink>
                <NavLink to="/login" className="mr-4 hover:underline">Login</NavLink>
                <NavLink to="/usermanagement" className="mr-4 hover:underline">UserManagement</NavLink>
            </nav>
        </header>
    );
}

export default Header;