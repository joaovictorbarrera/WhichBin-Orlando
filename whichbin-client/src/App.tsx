import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EducationalResources from './pages/EducationalResources';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<EducationalResources />} />
    </Routes>
  );
}

export default App;
