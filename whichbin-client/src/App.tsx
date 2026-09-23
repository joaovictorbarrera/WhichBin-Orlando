
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApiStatus from './pages/ApiStatus';
import EducationalResources from './pages/EducationalResources';
import ResourceDetails from './pages/ResourceDetails';
import About from './pages/About';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import Navigation from './components/Navigation';
import Announcements from './pages/Announcements';
import AnnouncementDetails from './pages/AnnouncementDetails';

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
        <Route path="/help" element={<Help />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route
         path="/announcements/:announcementId"
         element={<AnnouncementDetails />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
