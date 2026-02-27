import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
 
      <Sidebar />

      {/*el lado derecho */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
