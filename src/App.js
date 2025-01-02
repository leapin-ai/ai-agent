import { Routes, Route, Navigate } from 'react-router-dom';
import pages from './pages';
import MainLayout from './MainLayout';
import AiAgentApp from '@components/App';
import './index.scss';

const { Error, NotFound } = pages;

const App = ({ globalPreset }) => {
  return (
    <Routes>
      <Route
        element={
          <MainLayout
            preset={globalPreset}
            themeToken={globalPreset.themeToken}
            paths={[
              {
                title: 'AI Agent',
                path: '/ai-agent'
              }
            ]}
          />
        }
      >
        <Route path="/ai-agent/*" element={<AiAgentApp baseUrl="/ai-agent" />} />
        <Route path="error" element={<Error />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/ai-agent" />} />
      </Route>
    </Routes>
  );
};

export default App;
