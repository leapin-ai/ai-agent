const { Interview } = _InterviewAssistant;
const { interviewStage, default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <Interview
        stage={interviewStage}
        resume={{ src: window.PUBLIC_URL + '/test-resume.pdf' }}
        jd="前端工程师"
        recorder={callback => {
          return callback({ ready: true, text: '你好面试官' });
        }}
      />
    </PureGlobal>
  );
});

render(<BaseExample />);
