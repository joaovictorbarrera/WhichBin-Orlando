
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApiStatus from './pages/ApiStatus';
import EducationalResources from './pages/EducationalResources';
import ResourceDetails from './pages/ResourceDetails';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apistatus" element={<ApiStatus />} />
        <Route path="/resources" element={<EducationalResources />} />
        <Route path="/resources/:resourceId" element={<ResourceDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
