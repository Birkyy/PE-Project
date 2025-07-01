import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout(){
    return(
        <div className="flex flex-col min-h-screen overflow-hidden">
            <Header />
                <main className="flex-1 bg-white overflow-hidden">
                    <Outlet />
                </main>
            <Footer />
        </div>
    );
}

export default Layout;