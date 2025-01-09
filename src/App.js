import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import pages from './pages';
import MainLayout from './MainLayout';
import AiAgentApp from '@components/App';
import './index.scss';

const { Error, NotFound } = pages;

const App = ({ globalPreset }) => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route
        element={
          <MainLayout
            preset={globalPreset}
            themeToken={globalPreset.themeToken}
            navigateTo={path => {
              if (path === '/') {
                window.location.href = path;
                return;
              }
              navigate(path);
            }}
            paths={[
              {
                key: 'leapin-saas',
                title: 'Leapin Saas',
                path: '/'
              },
              {
                key: 'ai-agent',
                title: 'AI Agent',
                path: '/ai-agent'
              }
            ]}
          />
        }
      >
        <Route path="/ai-agent/*" element={<AiAgentApp baseUrl="/ai-agent" />} />
        <Route path="/login" element={'登录token失效'} />
        <Route path="error" element={<Error />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/ai-agent" />} />
      </Route>
    </Routes>
  );
};

export default App;
