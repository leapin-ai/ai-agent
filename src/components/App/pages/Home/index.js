import { createWithRemoteLoader } from '@kne/remote-loader';
import AiAgent from '@components/AiAgent';
import { useContext } from '../../context';
import LeftMenu from '@components/LeftMenu';

const Home = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  return (
    <Page menuWidth="200px" menuCloseWidth="80px" backgroundColor="transparent" menu={({ open }) => <LeftMenu baseUrl={baseUrl} open={open} />}>
      <AiAgent baseUrl={baseUrl} />
    </Page>
  );
});

export default Home;
