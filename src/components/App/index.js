import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import pages from './pages';

const { Home, CreateAgent, Marketplace, HrAssistant, ChatBot } = pages;

const App = ({ baseUrl }) => {
  return (
    <Provider value={{ baseUrl }}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="create" element={<CreateAgent />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="hr-assistant" element={<HrAssistant />} />
        <Route path="chat-bot" element={<ChatBot />} />
        <Route path="*" element={<Navigate to="404" />} />
      </Routes>
    </Provider>
  );
};

export default App;
