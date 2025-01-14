import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import pages from './pages';

const { Home, CreateAgent, Marketplace, HrAssistant, ChatBot, History } = pages;

const App = ({ baseUrl }) => {
  return (
    <Provider value={{ baseUrl }}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="create" element={<CreateAgent />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="detail" element={<HrAssistant />} />
        <Route path="chat-bot-test" element={<ChatBot />} />
        <Route path="history" element={<History />} />
      </Routes>
    </Provider>
  );
};

export default App;
