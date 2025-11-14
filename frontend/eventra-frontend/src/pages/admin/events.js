import { useState, useEffect } from "react";
import Link from "next/link"; 
import { Eye, Edit, Trash2, Plus, X, Calendar, MapPin, Users, DollarSign, Clock, FileText, Image } from "lucide-react";
import AdminSidebar from "./layout/AdminSidebar";
import AdminTopbar from "./layout/AdminTopbar";

const API_BASE_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }
  return { "Content-Type": "application/json" };
};

export default function EventManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState("basic");
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [eventForm, setEventForm] = useState({
    title: "",
    event_type: "other",
    organizer: "",
    venue: "",
    ticket_price: 0,
    total_seats: 0,
    available_seats: 0,
    event_date: new Date().toISOString().split('T')[0],
    event_time: "18:00:00",
    location: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(`Are you sure you want to delete event ID: ${eventId}?`)) {
      return;
    }
    
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
        method: "DELETE",
        headers: headers,
      });

      if (response.ok || response.status === 204) { 
        alert(`Event ${eventId} deleted successfully!`);
        fetchEvents();
      } else {
        const errorData = await response.json();
        console.error("Failed to delete event:", errorData);
        alert(`Failed to delete event. Details: ${errorData.detail || JSON.stringify(errorData)}. Did you log in?`);
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("A server error occurred during deletion.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === 'number') {
        newValue = Number(value);
    } else if (name === 'event_time') {
        newValue = value + ':00'; 
    }
    
    setEventForm({
      ...eventForm,
      [name]: newValue,
    });
  };

  const handleCreateEvent = async () => {
    const formData = new FormData();

    Object.entries(eventForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    formData.append("available_seats", eventForm.total_seats);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API_BASE_URL}/events/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("ERROR:", errorData);
        alert("Failed to create event");
        return;
      }

      alert("Event created successfully!");
      setIsModalOpen(false);
      fetchEvents();

    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error while uploading poster");
    }
  };

  const handleChangeInt = (e) => {
    const { name, value } = e.target;

    if (/^\d*$/.test(value)) {
      setEventForm({
        ...eventForm,
        [name]: value === "" ? "" : parseInt(value),
      });
    }
  };

  const getEventClass = (type) => {
    switch (type) {
      case 'movie': return 'bg-purple-100 text-purple-600';
      case 'workshop': return 'bg-blue-100 text-blue-600';
      case 'seminar': return 'bg-orange-100 text-orange-600';
      case 'conference': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  if (loading) {
      return <div className="ml-64 p-8">Loading admin data...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <AdminTopbar />

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold">Event Management</h1>
              <p className="text-gray-500 text-sm">Manage all your events in one place</p>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setTab("basic");
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:opacity-90"
            >
              <Plus size={16} /> Create Event
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search events..."
              className="border rounded-md px-3 py-2 flex-1 text-sm"
            />
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Movie</option>
              <option>Workshop</option>
              <option>Screening</option>
            </select>
            <button className="border rounded-md px-3 py-2 text-sm">Filter</button>
            <button className="border rounded-md px-3 py-2 text-sm">Export</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left p-3">Event</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Venue</th>
                  <th className="text-left p-3">Capacity</th>
                  <th className="text-left p-3">Fee</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{ev.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEventClass(ev.event_type)}`}>
                        {ev.event_type.charAt(0).toUpperCase() + ev.event_type.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">{ev.venue}</td>
                    <td className="p-3">{ev.total_seats - ev.available_seats}/{ev.total_seats}</td>
                    <td className="p-3">₹{ev.ticket_price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${ev.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 text-gray-600">
                      <Link href={`/events/${ev.id}`}>
                        <Eye size={16} className="cursor-pointer hover:text-blue-600" />
                      </Link>
                      <Edit size={16} className="cursor-pointer hover:text-yellow-600" />
                      <Trash2 
                        size={16} 
                        className="cursor-pointer hover:text-red-600" 
                        onClick={() => handleDeleteEvent(ev.id)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Enhanced Create Event Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Create New Event</h2>
                  <p className="text-blue-100 text-sm mt-1">Fill in the details to add a new event</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
              {[
                { name: "basic", label: "Basic Info", icon: <FileText size={16} /> },
                { name: "logistics", label: "Details", icon: <Calendar size={16} /> }
              ].map(({ name, label, icon }) => ( 
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition border-b-2 ${
                    tab === name 
                      ? "border-blue-600 text-blue-600 bg-white" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              <div className="space-y-4">
                {tab === "basic" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                      <input 
                        name="title" 
                        onChange={handleChange} 
                        value={eventForm.title} 
                        placeholder="Enter event title" 
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                      <select 
                        name="event_type" 
                        onChange={handleChange} 
                        value={eventForm.event_type} 
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      >
                        <option value="other">Select Event Type</option>
                        <option value="movie">Movie Screening</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="events">Conference</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Name *</label>
                      <input 
                        name="organizer" 
                        onChange={handleChange} 
                        value={eventForm.organizer} 
                        placeholder="Enter organizer name" 
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Poster</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition">
                        <div className="flex items-center gap-3">
                          <Image className="text-gray-400" size={24} />
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEventForm({ ...eventForm, poster: e.target.files[0] })}
                              className="text-sm text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Location
                      </label>
                      <input 
                        name="location" 
                        onChange={handleChange} 
                        value={eventForm.location} 
                        placeholder="e.g., Block A, City Name" 
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        name="description" 
                        onChange={handleChange} 
                        value={eventForm.description} 
                        placeholder="Describe your event..." 
                        rows="4"
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" 
                      />
                    </div>
                  </>
                )}

                {tab === "logistics" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Venue *
                      </label>
                      <input 
                        name="venue" 
                        onChange={handleChange} 
                        value={eventForm.venue} 
                        placeholder="e.g., Main Auditorium" 
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar size={16} className="inline mr-1" />
                          Date *
                        </label>
                        <input 
                          name="event_date" 
                          type="date" 
                          min={new Date().toISOString().split("T")[0]} 
                          value={eventForm.event_date} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock size={16} className="inline mr-1" />
                          Time *
                        </label>
                        <input 
                          name="event_time" 
                          type="time" 
                          value={eventForm.event_time.slice(0, 5)} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign size={16} className="inline mr-1" />
                        Registration Fee (₹) *
                      </label>
                      <input
                        name="ticket_price"
                        type="text"
                        onChange={handleChangeInt}
                        value={eventForm.ticket_price}
                        placeholder="e.g., 50"
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users size={16} className="inline mr-1" />
                        Total Capacity *
                      </label>
                      <input
                        name="total_seats"
                        type="text"
                        onChange={handleChangeInt}
                        value={eventForm.total_seats}
                        placeholder="e.g., 100"
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-md"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}