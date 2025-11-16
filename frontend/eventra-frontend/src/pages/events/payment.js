// Eventra-New/frontend/eventra-frontend/src/pages/events/payment.js (Change this file)

import Link from "next/link";
import { Smartphone, CreditCard, Clock } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8000/api";

export default function PaymentPage() {
  const router = useRouter();
  const { booking_id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("currentBookingData");

    if (!raw) {
      router.push("/");
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      localStorage.removeItem("currentBookingData");
      router.push("/");
      return;
    }

    if (!data.event || !data.number_of_tickets || !data.total_amount) {
      localStorage.removeItem("currentBookingData");
      router.push("/");
      return;
    }

    if (data.payment_status === "completed") {
      localStorage.removeItem("currentBookingData");
      router.push("/");
      return;
    }

    setBooking(data);
    setLoading(false);
  }, []);


  const handlePayment = async (e) => {
    e.preventDefault();
    const totalAmount = booking.number_of_tickets * booking.ticket_price;

    if (!booking) {
        alert("Booking data is missing. Please re-register.");
        router.push("/");
        return;
    }

    try {
        // Step 1: Simulate successful payment and call the API to complete the booking
        const token = localStorage.getItem("authToken");

        const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}/complete-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,   // ← REQUIRED
        },
        body: JSON.stringify({
        payment_id: `PI_${Date.now()}`,
        }),
      });

        const data = await response.json();

        if (response.ok) {
    localStorage.setItem("finalBookingData", JSON.stringify(data));
    localStorage.removeItem("currentBookingData");

    router.push(`/events/processing?booking_id=${booking.id}`);
} 
else if (data.message === "Payment already completed.") {
    // Gracefully redirect
    localStorage.setItem("finalBookingData", JSON.stringify(data));
    router.push(`/events/processing?booking_id=${booking.id}`);
}
else {
    alert(`Payment completion failed: ${data.error || JSON.stringify(data)}`);
}

    } catch (error) {
        console.error("Payment error:", error);
        alert("A server error occurred during payment. Please check your bank status.");
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading payment summary...</div>;
  }
  
  if (!booking) {
      return <div className="min-h-screen flex items-center justify-center">Invalid booking ID.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      {/* Top Bar */}
      {/* ... (Top bar remains the same) */}

      {/* Payment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Registration Summary</h2>
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex justify-center items-center">🎬</div>
            <div>
              <p className="font-medium">Event: {booking.event}</p> {/* Shows Event PK for now, improve by storing event title */}
              <p className="text-xs text-gray-500">Booking ID: #{booking.id}</p>

            </div>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>Student Name:</b> {booking.customer_name}</p>
            <p><b>Roll Number:</b> {booking.roll_number}</p>
            <p><b>Email:</b> {booking.email}</p>
            <p><b>Phone:</b> {booking.phone}</p>
            <p><b>Tickets:</b> {booking.number_of_tickets} ticket(s)</p>
            <p><b>Total:</b> ₹{booking.total_amount}</p>
          </div>

          <div className="mt-6 border-t pt-3 text-sm text-green-700 bg-green-50 p-3 rounded-md">
            ✅ Secure Payment — your details are encrypted and safe.
          </div>
        </div>

        {/* Right: Payment Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* ... (Payment options section remains the same) */}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 mt-6"
          >
            Pay ₹{booking.total_amount}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By proceeding, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}