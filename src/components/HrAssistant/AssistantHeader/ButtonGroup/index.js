import Recruit from './Recruit';
import Chatbot from './Chatbot';
import InterviewAssistant from './InterviewAssistant';

const ButtonGroup = ({ type, ...props }) => {
  const Component =
    {
      0: Recruit,
      1: Chatbot,
      2: InterviewAssistant
    }[type] || Chatbot;
  return <Component {...props} />;
};

export default ButtonGroup;
