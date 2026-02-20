import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/20 bg-white/40 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* <Wallet className="h-7 w-7 text-dark" />
               */}
               <img src="/logo_square_transparent.png" alt="Vision" className="h-12 w-15" />
              <span className="text-2xl font-bold text-dark">
                VISION
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-8 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors duration-200 ${
                isActive('/')
                  ? 'text-blue-600'
                  : 'text-dark/70 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="text-dark/70 hover:text-blue-600 transition-colors duration-200"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
