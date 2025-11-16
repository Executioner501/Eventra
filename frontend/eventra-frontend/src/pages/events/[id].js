// Eventra-New/frontend/eventra-frontend/src/pages/events/[id].js (Change this file)

import Link from "next/link";
import { useRouter } from "next/router";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8000/api";

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to map Django type to human-readable category for display
  const getCategoryLabel = (type) => {
    switch(type) {
      case 'movie': return 'Movie';
      case 'workshop': return 'Workshop';
      case 'seminar': return 'Seminar';
      case 'conference': return 'Conference';
      default: return 'Other';
    }
  }

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/events/${id}/`);
          if (!response.ok) {
            throw new Error('Event not found');
          }
          const data = await response.json();
          setEvent(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching event:", error);
          setLoading(false);
          setEvent(null);
        }
      };
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading event details...</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Event not found.</div>;
  }
  
  // Format date and time
  const formattedDateTime = `${event.event_date} @ ${event.event_time.slice(0, 5)}`;
  const categoryLabel = getCategoryLabel(event.event_type);
  const totalSeats = event.total_seats;
  const availableSeats = event.available_seats;
  const capacityPercentage = totalSeats > 0 ? ((totalSeats - availableSeats) / totalSeats) * 100 : 0;


  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/home" className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to Events
        </Link>
        <h1 className="font-semibold text-lg text-indigo-600">Eventra</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Image */}
        <div className="flex-1 bg-gray-100 rounded-2xl h-[400px] flex justify-center items-center  overflow-hidden">
          {/* choose the best image URL from the event object */}
          {(() => {
            const src = event?.image || event?.image_url || event?.poster || event?.cover || event?.banner || event?.thumbnail;
            if (src) {
              return (
                <img
                  src={src}
                  alt={event.title || 'Event image'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // fallback in case the image fails to load
                    e.currentTarget.onerror = null;
                  }}
                />
              );
            }
            // fallback placeholder if no image provided
            return <p className="text-gray-400">Image Placeholder</p>;
          })()}
        </div>


        {/* Right: Details */}
        <div className="flex-[1.2] space-y-6">
          <div>
            <span className="bg-purple-100 text-purple-600 text-xs font-medium px-3 py-1 rounded-full">
              {categoryLabel}
            </span>
            <h1 className="text-2xl font-bold mt-2">{event.title}</h1>
            {/* event.subtitle is not in the Django model, keeping optional */}
            {event.subtitle && (
              <p className="text-gray-500">{event.subtitle}</p> 
            )}

            <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
              <span>📅 {formattedDateTime}</span>
              <MapPin size={14} /> {event.venue}
            </div>
            
            <div className="flex gap-2 mt-3">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">{categoryLabel}</span>
              {/* Other tags are not in Django model, keeping placeholders */}
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">By {event.organizer}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <h2 className="font-semibold mb-2">About this Event</h2>
            <p className="text-gray-600 text-sm">
              {event.description}
            </p>
          </div>

          {/* Timing is static here, but should be dynamic based on API/form choices */}
          <div className="bg-white p-4 rounded-xl border">
            <h2 className="font-semibold mb-3">Select Timing</h2>
            <div className="flex gap-3">
              <Link href={`/events/register?event_id=${event.id}&time=${event.event_time}`} passHref>
                <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md">
                  <Calendar size={16} /> {event.event_time.slice(0, 5)}
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <h2 className="font-semibold mb-2">Registration Details</h2>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} /> Capacity
              </div>
              <p className="text-gray-500">{totalSeats - availableSeats}/{totalSeats}</p>
            </div>
            <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gray-800 h-full" 
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-yellow-600 mt-1 text-right">
              {availableSeats > 0 ? `${availableSeats} spots remaining` : 'Sold out!'}
            </p>

            <div className="flex justify-between items-center mt-4">
              <p className="font-semibold">Registration Fee</p>
              <p className="font-bold text-gray-800">₹{event.ticket_price}</p>
            </div>

            <Link href={`/events/register?event_id=${event.id}`} passHref>
              <button 
                className="mt-3 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 disabled:bg-gray-500"
                disabled={availableSeats <= 0}
              >
                {availableSeats > 0 ? 'Register Now' : 'Sold Out'}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}