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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-300 px-4">
        <div className="text-white font-semibold animate-pulse text-xl">Loading ticket details...</div>
      </div>
    );

  if (!ticket)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-300 px-4">
        <div className="text-red-500 font-semibold text-xl">Ticket not found</div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-600 to-blue-300 px-4 py-6">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
          Ticket Details
        </h2>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{ticket.title}</h3>
          <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>

          {ticket.status && (
            <div className="mt-4 space-y-2">
              <p>
                <strong className="text-gray-800 dark:text-gray-200">Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-white font-medium ${
                    ticket.status.toLowerCase() === "open"
                      ? "bg-green-500"
                      : ticket.status.toLowerCase() === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  {ticket.status}
                </span>
              </p>

              {ticket.priority && (
                <p>
                  <strong className="text-gray-800 dark:text-gray-200">Priority:</strong>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{ticket.priority}</span>
                </p>
              )}

              {ticket.relatedSkills?.length > 0 && (
                <p>
                  <strong className="text-gray-800 dark:text-gray-200">Related Skills:</strong>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{ticket.relatedSkills.join(", ")}</span>
                </p>
              )}

              {ticket.helpfulNotes && (
                <div>
                  <strong className="text-gray-800 dark:text-gray-200">Helpful Notes:</strong>
                  <div className="prose max-w-none rounded-lg mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                  </div>
                </div>
              )}

              {ticket.assignedTo && (
                <p>
                  <strong className="text-gray-800 dark:text-gray-200">Assigned To:</strong>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{ticket.assignedTo?.email}</span>
                </p>
              )}

              {ticket.createdAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created At: {new Date(ticket.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
