import Link from "next/link";
import { BarChart3, Film, Users, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/router";

export default function AdminSidebar() {
  const router = useRouter();
  
  const isActive = (path) => router.pathname === path;

  return (
    <aside className="w-64 bg-gray-50 h-screen flex flex-col justify-between shadow-sm fixed">
      <div>
        <div className="flex items-center gap-2 p-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <BarChart3 size={18} />
          </div>
          <h1 className="font-semibold text-lg">Eventra</h1>
        </div>

        <nav className="mt-4 flex flex-col space-y-2 px-4">
          <Link href="/admin/dashboard">
            <div className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
              isActive('/admin/dashboard') 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-indigo-50'
            }`}>
              <BarChart3 size={18} /> Dashboard
            </div>
          </Link>
          
          <Link href="/admin/events">
            <div className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
              isActive('/admin/events') 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-indigo-50'
            }`}>
              <Film size={18} /> Event Management
            </div>
          </Link>
          
          <Link href="/admin/volunteers">
            <div className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
              isActive('/admin/volunteers') 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-indigo-50'
            }`}>
              <Users size={18} /> Volunteers
            </div>
          </Link>
          
          <Link href="/admin/settings">
            <div className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
              isActive('/admin/settings') 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-indigo-50'
            }`}>
              <Settings size={18} /> Settings
            </div>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-200 text-purple-700 font-bold flex items-center justify-center rounded-full">
            AU
          </div>
          <div>
            <p className="font-semibold text-sm">Admin User</p>
            <p className="text-xs text-gray-500">System Admin</p>
          </div>
        </div>
        <Link href="/admin/login">
        <button className="flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-red-600">
          <LogOut size={16} /> Logout
        </button>
        </Link>
      </div>
    </aside>
  );
}