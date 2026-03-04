import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { OnboardingPortal } from './pages/OnboardingPortal';
import { CommandCenter } from './pages/CommandCenter';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portal" element={<OnboardingPortal />} />
      <Route path="/command-center" element={<CommandCenter />} />
    </Routes>
  );
}

export default App;