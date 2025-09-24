import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-opacity-95 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo aligned to left edge */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-blue-300 transition-colors"
            >
              SmartTix
            </Link>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link
                  to="/signup"
                  className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-400 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-400 transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm mr-2">Hi, {user?.email}</span>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
