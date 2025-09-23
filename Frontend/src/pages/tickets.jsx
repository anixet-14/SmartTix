import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); // Refresh list
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
  <div
    key={ticket._id}
      className="card shadow-lg p-5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:scale-105 transform transition-all duration-200 cursor-pointer rounded-xl border border-gray-600"
    onClick={() => navigate(`/tickets/${ticket._id}`)} // programmatic navigation
  >
    <h3 className="font-bold text-lg">{ticket.title}</h3>
    <p className="text-sm">{ticket.description}</p>
    <p className="text-sm text-gray-500">
      Created At: {new Date(ticket.createdAt).toLocaleString()}
    </p>

    {/* Status dropdown for moderator/admin */}
    <p className="text-sm">
      <strong>Status:</strong>{" "}
      {["moderator", "admin"].includes(localStorage.getItem("role")) ? (
        <select
          value={ticket.status}
          onChange={async (e) => {
            const newStatus = e.target.value;
            try {
              const res = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/api/tickets/update-status`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ ticketId: ticket._id, status: newStatus }),
                }
              );
              const data = await res.json();
              if (res.ok) fetchTickets();
              else alert(data.error || "Failed to update status");
            } catch (err) {
              console.error("Error updating status:", err);
            }
          }}
          className="select select-bordered"
          onClick={(e) => e.stopPropagation()} // prevent parent div click
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      ) : (
        ticket.status
      )}
    </p>
  </div>
))}


        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>

    </div>
  );
}
