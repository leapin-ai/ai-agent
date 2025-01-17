const { default: CandidatePreview } = _CandidatePreview;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset, applicationDetail } = _mockPreset;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <CandidatePreview data={applicationDetail.data} />
    </PureGlobal>
  );
});

render(<BaseExample />);
