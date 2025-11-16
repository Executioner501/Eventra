import React from "react";
import { useRouter } from "next/router";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

const EventCard = ({ event }) => {
  const router = useRouter();
  const eventType = event.event_type || event.category;

  // Get event type color
  const getTypeColor = () => {
    switch(eventType) {
      case 'movie':
        return 'bg-purple-100 text-purple-600';
      case 'workshop':
        return 'bg-blue-100 text-blue-600';
      case 'seminar':
        return 'bg-green-100 text-green-600';
      case 'conference':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/events/${event.id}`);
  };

  return (
    <div
      className="group relative w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg
      transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Background Image with Zoom Effect on Hover */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            className="h-full w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <span className="text-6xl opacity-20">🎉</span>
          </div>
        )}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {/* Content Container */}
      <div className="relative flex h-full flex-col justify-between p-6 text-white min-h-[400px]">
        {/* Top Section: Category Badge */}
        <div className="flex h-40 items-start justify-between">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getTypeColor()} shadow-sm`}>
            {event.category || eventType}
          </span>
          {event.available_seats !== undefined && (
            <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
              {event.available_seats} seats left
            </span>
          )}
        </div>
        
        {/* Middle Section: Details (slides up on hover) */}
        <div className="space-y-4 transition-transform duration-500 ease-in-out group-hover:-translate-y-16">
          <div>
            <h3 className="text-2xl font-bold text-white line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/80">
              <MapPin size={14} />
              <span>{event.location || event.venue}</span>
            </div>
            {event.event_date && (
              <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
                <Calendar size={14} />
                <span>{formatDate(event.event_date)}</span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white/90 text-sm mb-1">OVERVIEW</h4>
            <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
              {event.description}
            </p>
          </div>
          {event.organizer && (
            <div className="text-xs text-white/60">
              Organized by: {event.organizer}
            </div>
          )}
        </div>

        {/* Bottom Section: Price and Button (revealed on hover) */}
        <div className="absolute -bottom-24 left-0 w-full p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-4xl font-bold text-white">
                ₹{event.ticket_price || 0}
              </span>
              <br></br>
              <span className="text-white/80 text-sm ml-2">Per Ticket</span>
            </div>
            <button 
              onClick={handleBookNow}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors duration-200 shadow-lg"
            >
              Book Now 
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;