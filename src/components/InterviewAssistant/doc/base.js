const { Report } = _InterviewAssistant;
const { interviewReport, resumeData } = _mockPreset;
const BaseExample = () => {
  return <Report data={interviewReport} extraData={{ resumeData }} jd="产品经理" />;
};

render(<BaseExample />);
