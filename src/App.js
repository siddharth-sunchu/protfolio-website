import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortfolioWebsite from './PortfolioWebsite';
import { ThankYou } from './Components';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortfolioWebsite />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
