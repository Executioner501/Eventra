import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EventBookings() {
  const router = useRouter();
  const { id } = router.query;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `http://localhost:8000/api/events/${id}/bookings/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading bookings...</div>;
  }

  return (
    <div className="p-8">
        <button
        onClick={() => router.push("/admin/events")}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
         ← Back to Events
        </button>
      <h1 className="text-2xl font-semibold mb-6">
        Bookings for Event #{id}
      </h1>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 border-b">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Tickets</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Booking ID</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{b.customer_name}</td>
                <td className="p-3">{b.number_of_tickets}</td>
                <td className="p-3 capitalize">{b.payment_status}</td>
                <td className="p-3 font-mono text-gray-700">{b.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <p className="text-gray-500 mt-4 text-sm">
          No bookings found for this event.
        </p>
      )}
    </div>
  );
}
