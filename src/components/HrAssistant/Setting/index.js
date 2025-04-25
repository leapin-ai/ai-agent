import InterviewAssistant from './InterviewAssistant';

const mapping = {
  2: InterviewAssistant
};

const Setting = ({ type, empty, ...props }) => {
  const Component = mapping[type];
  if (!Component) {
    return empty || null;
  }
  return <Component type={type} {...props} />;
};

export default Setting;
