import InterviewAssistant from './InterviewAssistant';
import AIInterview from './AIInterview';
import ChatbotAssistant from './ChatbotAssistant';

const mapping = {
  1: ChatbotAssistant,
  2: InterviewAssistant,
  3: AIInterview
};

const Setting = ({ type, empty, ...props }) => {
  const Component = mapping[type];
  if (!Component) {
    return empty || null;
  }
  return <Component type={type} {...props} />;
};

export default Setting;
