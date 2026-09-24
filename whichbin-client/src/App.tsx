
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApiStatus from './pages/ApiStatus';
import EducationalResources from './pages/EducationalResources';
import ResourceDetails from './pages/ResourceDetails';
import About from './pages/About';
import Help from './pages/Help';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';
import AdminResources from './pages/admin/AdminResources';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
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
        <Route path="/help" element={<Help />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
