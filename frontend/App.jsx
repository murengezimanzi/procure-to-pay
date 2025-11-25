import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Layout from './src/components/layout';

// Pages
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import RequestForm from './src/pages/RequestForm';
import RequestDetail from './src/pages/RequestDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Wrapped in Layout) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<RequestForm />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;