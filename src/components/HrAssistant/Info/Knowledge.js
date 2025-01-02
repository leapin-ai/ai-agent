import { createWithRemoteLoader } from '@kne/remote-loader';

const Knowledge = createWithRemoteLoader({
  modules: ['components-core:FileList']
})(({ remoteModules }) => {
  const [FileList] = remoteModules;
  return <FileList apis={{}} />;
});

export default Knowledge;
