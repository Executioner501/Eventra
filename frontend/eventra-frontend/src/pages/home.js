import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import SearchBar from '../components/Common/SearchBar';
import FilterButton from '../components/Events/FilterButton';
import EventCard from '../components/Events/EventCard';
import { Film, Wrench, Tv, Palette, BookOpen, Briefcase, Trophy } from 'lucide-react';

// Base URL for the Django API
const API_BASE_URL = "http://localhost:8000/api";

const HomePage = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map Django backend event_type to frontend display labels
  const DJANGO_EVENT_TYPES = {
    'movie': 'Screenings',
    'workshop': 'Workshops',
    'seminar': 'Seminars',
    'other': 'Culturals',
  };

  const filters = [
    { icon: null, label: 'All Events' },
    { icon: <Tv size={18} />, label: 'Screenings' },
    { icon: <Wrench size={18} />, label: 'Workshops' },
    { icon: <Palette size={18} />, label: 'Culturals' },
    { icon: <Briefcase size={18} />, label: 'Seminars' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        const formattedEvents = data.map(event => ({
            ...event,
            category: DJANGO_EVENT_TYPES[event.event_type] || event.event_type,
            location: event.venue,
            duration: 'N/A',
            description: event.description,
        }));
        setEvents(formattedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
        setEvents([]); 
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on activeFilter
  const filteredEvents = events.filter(event => {
    if (activeFilter === 'All Events') return true;
    return event.category === activeFilter;
  });

  // Handle URL filter parameter
  useEffect(() => {
    if (!router.isReady) return;

    const urlFilter = router.query.filter;

    if (urlFilter) {
        // Convert backend type (e.g., "movie") to frontend label (e.g., "Screenings")
        const mapped = DJANGO_EVENT_TYPES[urlFilter];
        if (mapped) {
            setActiveFilter(mapped);
        } else {
            // If no mapping exists, show all events
            setActiveFilter('All Events');
        }
    } else {
        // No filter parameter means show all events
        setActiveFilter('All Events');
    }
  }, [router.isReady, router.query.filter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>
        
        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-gray-500">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-500">No events found in this category.</p>
          ) : (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} /> 
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;