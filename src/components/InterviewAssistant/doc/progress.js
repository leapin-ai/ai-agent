const { InterviewProgress } = _InterviewAssistant;
const { interviewStage, default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <InterviewProgress
        list={[1, 2, 3, 5]}
        stage={interviewStage}
        onStageChange={async () => {
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        }}
      />
    </PureGlobal>
  );
});

render(<BaseExample />);
