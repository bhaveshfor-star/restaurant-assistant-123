import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import KnowledgeManager from './pages/admin/KnowledgeManager';
import IssuesManager from './pages/admin/IssuesManager';
import ChatLogs from './pages/admin/ChatLogs';
import UsersManager from './pages/admin/UsersManager';
import AdminAnalytics from './pages/admin/AdminAnalytics';  //update

function PublicLayout({ children }: { children: React.ReactNode }) {
  return ( 
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with navbar+footer */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/analytics" element={<PublicLayout><AnalyticsPage /></PublicLayout>} />

          {/* Full-screen public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Chatbot - full screen with navbar */}
          <Route path="/chatbot" element={<><Navbar /><ChatbotPage /></>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="knowledge" element={<KnowledgeManager />} />
            <Route path="issues" element={<IssuesManager />} />
            <Route path="chats" element={<ChatLogs />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
// github upload test