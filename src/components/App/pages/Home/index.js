import { createWithRemoteLoader } from '@kne/remote-loader';
import AiAgent from '@components/AiAgent';
import { useContext } from '../../context';

const Home = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  return (
    <Page backgroundColor="transparent">
      <AiAgent baseUrl={baseUrl} />
    </Page>
  );
});

export default Home;
