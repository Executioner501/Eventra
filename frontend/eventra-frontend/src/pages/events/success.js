// Eventra-New/frontend/eventra-frontend/src/pages/events/success.js (Change this file)

import Link from "next/link";
import { CheckCircle, Mail, Phone, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function SuccessPage() {
const [booking, setBooking] = useState(null);
const [loading, setLoading] = useState(true);

// Load the final, completed booking data from local storage
useEffect(() => {
  const data = localStorage.getItem("finalBookingData");
  if (data) {
    const parsedData = JSON.parse(data);
    setBooking(parsedData);
    localStorage.removeItem("finalBookingData"); // Clear data after use
  }
  setLoading(false);
}, []);

if (loading) {
  return <div className="min-h-screen flex items-center justify-center">Loading confirmation details...</div>;
}

if (!booking) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-red-500">Error: Booking details not found.</p>
        <Link href="/home"><button className="mt-4 text-sm text-gray-700 underline">← Back to Events</button></Link>
      </div>
    </div>
  );
}

// Assuming booking.event is the event ID. We need the event title/details.
// For a full solution, you would fetch event details or ensure the API returns them.
// For now, we'll use placeholder text for event title.
const eventTitle = booking.tickets[0]?.booking?.event?.title || "Your Event"; 
const firstTicket = booking.tickets[0];

return (
  <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-center">
    <div className="max-w-4xl bg-white shadow-sm rounded-xl p-8 w-full">
      <div className="text-center mb-6">
        <CheckCircle size={50} className="text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-green-600 mt-3">Registration Successful!</h1>
        <p className="text-gray-600 text-sm mt-1">
          Your registration for <b>{booking.event_title}</b> has been confirmed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Ticket Info */}
        <div className="border rounded-lg p-6">
          <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium mb-2 inline-block">
            {eventTitle} Ticket
          </span>
          <h2 className="font-semibold text-lg">{booking.event_title}</h2>
          <p className="text-xs text-gray-500 mt-1">Registration ID: {booking.id}</p>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>🕒 <b>Date & Time:</b>{booking.event_date}{booking.event_time}</p>
            <p>📍 <b>Venue:</b> N/A {booking.venue}</p>
            <p>👤 <b>Student:</b> {booking.customer_name} ({booking.roll_number} - {booking.section})</p>
            <p>🎟 <b>Slots:</b> {booking.number_of_tickets} attendee(s)</p>
            <p>💰 <b>Amount Paid:</b> ₹{booking.total_amount}</p>
          </div>
          
          {/* Show OTP for first ticket */}
          {firstTicket && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
                  <p className="font-semibold">Verification OTP (Ticket {firstTicket.ticket_number}):</p>
                  <p className="font-mono text-lg">{firstTicket.otp_code}</p>
              </div>
          )}

          <div className="mt-4 text-center">
            <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 text-sm">
              Download Ticket
            </button>
            <button className="ml-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
              Share Event
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          {/* ... (Important Information box remains the same) */}

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Mail size={14} /> Email: events@college.edu
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Phone size={14} /> Phone: +91 99999 88888
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 text-sm text-blue-700 rounded-lg p-3 flex items-center gap-2">
            <Mail size={14} /> A confirmation email has been sent to <b>{booking.email}</b>.
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/home">
          <button className="text-sm text-gray-700 hover:text-gray-900 underline">← Back to Events</button>
        </Link>
      </div>
    </div>
  </div>
);
}