
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
import ProtectedRoute from './components/ProtectedRoute';
import Announcements from './pages/Announcements';
import AnnouncementDetails from './pages/AnnouncementDetails';
import ItemSearch from './pages/ItemSearch';
import ItemDetail from './pages/ItemDetail';

function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item-search" element={<ItemSearch />} />
        <Route path="/search" element={<ItemSearch />} />
        <Route path="/item-search/:itemId" element={<ItemDetail />} />
        <Route path="/apistatus" element={<ApiStatus />} />
        <Route path="/resources" element={<EducationalResources />} />
        <Route path="/resources/:resourceId" element={<ResourceDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcements/:announcementId" element={<AnnouncementDetails />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/items" element={<ProtectedRoute><AdminItems /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute><AdminResources /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
