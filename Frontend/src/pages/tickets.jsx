import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets();
      } else alert(data.message || "Ticket creation failed");
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Create a New Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full bg-gray-50 focus:bg-white focus:ring-indigo-500"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full bg-gray-50 focus:bg-white focus:ring-indigo-500"
          required
        ></textarea>
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Tickets</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:scale-105 transform transition-all duration-200 cursor-pointer rounded-xl border border-gray-600 shadow-lg p-5"
            onClick={() => navigate(`/tickets/${ticket._id}`)}
          >
            <h3 className="text-xl font-bold text-white">{ticket.title}</h3>
            <p className="text-gray-200 mt-1">{ticket.description}</p>
            <p className="text-sm text-gray-400 mt-2">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>

            <p className="text-sm mt-2">
              <strong className="text-white">Status:</strong>{" "}
              {["moderator", "admin"].includes(localStorage.getItem("role")) ? (
                <select
                  value={ticket.status}
                  onChange={async (e) => {
                    e.stopPropagation(); // prevent card click
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
                  className="select select-bordered w-40 mt-1"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              ) : (
                <span className="text-gray-300">{ticket.status}</span>
              )}
            </p>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-gray-500 text-center">No tickets submitted yet.</p>}
      </div>
    </div>
  );
}
