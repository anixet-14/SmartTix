import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else console.error(data.error);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({ role: user.role, skills: user.skills?.join(", ") });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/update-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: editingUser,
          role: formData.role,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) return console.error(data.error || "Failed to update user");
      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(users.filter((user) => user.email.toLowerCase().includes(query)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-300 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Admin Panel - Manage Users</h1>

        <input
          type="text"
          placeholder="Search by email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-3 mb-6 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 border border-gray-200"
        />

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 transition hover:shadow-xl"
            >
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Role:</span> {user.role}</p>
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Skills:</span>{" "}
                {user.skills && user.skills.length ? user.skills.join(", ") : "N/A"}
              </p>

              {editingUser === user.email ? (
                <div className="mt-4 space-y-3">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Comma-separated skills"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition duration-200"
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-center text-white mt-6">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
