import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok || data.tickets) {
        let filtered = data.tickets || [];

        // Filter tickets for moderator
        if (role === "moderator") {
          filtered = filtered.filter((ticket) =>
            ticket.assignedTo.some((mod) => mod._id === userId)
          );
        }

        setTickets(filtered);
      } else {
        alert(data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
        fetchTickets();
      } else alert(data.message || "Ticket creation failed");
    } catch (err) {
      console.error(err);
      alert("Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/tickets/${ticketId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchTickets();
      } else {
        alert(data.message || "Failed to delete ticket");
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-600 to-blue-300 px-4 py-6">
      {/* Create Ticket Form */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
          Create a New Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ticket Title"
            className="w-full input input-bordered bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ticket Description"
            className="w-full textarea textarea-bordered bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2"
            required
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-200"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="w-full max-w-4xl space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-5 border border-gray-200 hover:scale-105 transform transition-all duration-200"
            >
              {/* Only title clickable */}
              <h3
                className="text-xl font-bold text-blue-700 dark:text-blue-400 cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket._id}`)}
              >
                {ticket.title}
              </h3>

              <p className="text-gray-700 dark:text-gray-200 mt-1">
                {ticket.description}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>

              <p className="text-sm mt-2">
                <strong className="text-gray-700 dark:text-gray-300">
                  Status:
                </strong>{" "}
                {["moderator", "admin"].includes(role) ? (
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
                            body: JSON.stringify({
                              ticketId: ticket._id,
                              status: newStatus,
                            }),
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
                  <span className="text-gray-500 dark:text-gray-400">
                    {ticket.status}
                  </span>
                )}
              </p>

              {ticket.assignedTo?.length > 0 && (
                <p className="text-sm mt-1">
                  <strong className="text-gray-700 dark:text-gray-300">
                    Assigned To:
                  </strong>{" "}
                  {ticket.assignedTo.map((mod) => mod.email).join(", ")}
                </p>
              )}

              {/* Delete button only for creator or admin */}
              {(role === "admin" || ticket.createdBy?._id === userId) && (
                <button
                  onClick={() => handleDelete(ticket._id)}
                  className="mt-3 btn btn-error bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-all duration-200"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-100 dark:text-gray-400">
            No tickets submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
