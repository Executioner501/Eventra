import { Bell, Eye } from "lucide-react";
import { useRouter } from "next/router";

export default function AdminTopbar() {
  const router = useRouter();

  const handleVerifyTickets = () => {
    // Navigate to volunteer verify page (now supports both admin & volunteer)
    router.push('/volunteer/verify');
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your event platform</p>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500" size={20} />
        <button 
          onClick={handleVerifyTickets}
          className="flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-gray-50 transition"
        >
          <Eye size={16} /> Verify Tickets
        </button>
      </div>
    </header>
  );
}