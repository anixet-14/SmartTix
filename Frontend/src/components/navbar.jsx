import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaUserCircle } from "react-icons/fa";
import profilePic from "../assets/profile.jpg"


export default function Navbar() {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, [location]); // update on route change

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-blue-400 shadow-md relative z-10">
      {/* Left: Logo */}
      <div className="text-white font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
        SmartTix
      </div>

      {/* Right: User section */}
      <div className="flex items-center space-x-4 relative">
        {/* Admin Panel Link */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            Admin Panel
          </button>
        )}

        {user ? (
          <>
            <span className="text-white font-medium">Hi, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition duration-200"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition duration-200"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </>
        )}

        {/* Profile Picture */}
        <div className="relative">
          <img
            src={profilePic}// replace with your image
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white hover:scale-105 transition-transform duration-200"
            onClick={() => setShowProfileCard(true)}
          />

          {/* Overlay + Card */}
          {showProfileCard && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setShowProfileCard(false)}
              ></div>

              {/* Card */}
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fadeInScale">
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-2 border-blue-400"
                  />
                 <h2 className="text-xl font-bold mb-1 leading-tight">Aniket Gupta</h2>
                <h4 className="text-sm text-gray-500 leading-tight">Full Stack Developer</h4>

                  <div className="flex space-x-6 text-blue-600 text-2xl">
                    <a href="https://github.com/anixet-14" target="_blank" rel="noreferrer">
                      <FaGithub />
                    </a>
                    <a href="https://www.linkedin.com/in/aniket1408/" target="_blank" rel="noreferrer">
                      <FaLinkedin />
                    </a>
                    <a href="mailto:aniket.ag1408@gmail.com" target="_blank" rel="noreferrer">
                      <FaEnvelope />
                    </a>
                    <a href="http://anixet14.vercel.app/" target="_blank" rel="noreferrer">
                      <FaUserCircle />
                    </a>
                  </div>
                  <a
                    href="https://github.com/anixet-14/SmartTix/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center mt-3 px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition duration-200 w-full"
                  >
                    <FaGithub className="mr-2" />
                    Project GitHub Repo
                  </a>
                  <button
                    onClick={() => setShowProfileCard(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
