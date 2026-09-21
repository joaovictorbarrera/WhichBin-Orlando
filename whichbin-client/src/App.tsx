
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EducationalResources from './pages/EducationalResources';
import ResourceDetails from './pages/ResourceDetails';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<EducationalResources />} />
        <Route path="/resources/:resourceId" element={<ResourceDetails />} />
      </Routes>
    </>
  );
}

export default App;