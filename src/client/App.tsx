import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { CoursesPage } from './pages/Courses';
import { CourseDetailPage } from './pages/CourseDetail';
import { CourseManagePage } from './pages/CourseManage';
import { CurriculumPage } from './pages/Curriculum';
import { AssessmentsPage } from './pages/Assessments';
import { AssessmentTakePage } from './pages/AssessmentTake';
import { TutorPage } from './pages/Tutor';
import { StudentsPage } from './pages/Students';
import { StudentProfilePage } from './pages/StudentProfile';
import { SettingsPage } from './pages/Settings';
import { SchoolsPage } from './pages/Schools';

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const checkAuth = useAuth((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/manage" element={<CourseManagePage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="assessments/:id/take" element={<AssessmentTakePage />} />
        <Route path="tutor" element={<TutorPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
