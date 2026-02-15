import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoryView from './pages/CategoryView';
import Returns from './pages/Returns';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg">
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/category/:categoryName" element={<CategoryView />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


