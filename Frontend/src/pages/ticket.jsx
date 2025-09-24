import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTicket(data.ticket);
        else alert(data.message || "Failed to fetch ticket");
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-12 text-indigo-600 font-semibold animate-pulse">
        Loading ticket details...
      </div>
    );
  if (!ticket)
    return <div className="text-center mt-12 text-red-500 font-semibold">Ticket not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Ticket Details</h2>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-200 transition hover:shadow-xl">
        <h3 className="text-2xl font-semibold text-gray-800">{ticket.title}</h3>
        <p className="text-gray-700">{ticket.description}</p>

        {ticket.status && (
          <div className="mt-4">
            <div className="border-t border-gray-300 mt-4 mb-2"></div>
            <p>
              <strong className="text-gray-800">Status:</strong>{" "}
              <span className={`px-2 py-1 rounded-full text-white font-medium ${
                ticket.status.toLowerCase() === "open"
                  ? "bg-green-500"
                  : ticket.status.toLowerCase() === "pending"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}>
                {ticket.status}
              </span>
            </p>
            {ticket.priority && (
              <p>
                <strong className="text-gray-800">Priority:</strong>{" "}
                <span className="text-gray-600">{ticket.priority}</span>
              </p>
            )}
            {ticket.relatedSkills?.length > 0 && (
              <p>
                <strong className="text-gray-800">Related Skills:</strong>{" "}
                <span className="text-gray-600">{ticket.relatedSkills.join(", ")}</span>
              </p>
            )}
            {ticket.helpfulNotes && (
              <div>
                <strong className="text-gray-800">Helpful Notes:</strong>
                <div className="prose max-w-none rounded-lg mt-2 p-3 bg-gray-50 border border-gray-200">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}
            {ticket.assignedTo && (
              <p>
                <strong className="text-gray-800">Assigned To:</strong>{" "}
                <span className="text-gray-600">{ticket.assignedTo?.email}</span>
              </p>
            )}
            {ticket.createdAt && (
              <p className="text-sm text-gray-400 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
