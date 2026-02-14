import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-bg border-b-2 border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-dark" />
              <span className="text-2xl font-bold text-dark">
                Vision
              </span>
            </Link>
          </div>
          
          {/* <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 transition-all duration-200 font-semibold ${
                isActive('/')
                  ? 'bg-dark text-white'
                  : 'text-dark'
              }`}
            >
              Dashboard
            </Link>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
