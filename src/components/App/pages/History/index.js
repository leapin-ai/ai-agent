import { createWithRemoteLoader } from '@kne/remote-loader';
import { useContext } from '../../context';
import LeftMenu from '@components/LeftMenu';
import History from '@components/ChatHistory';

const HistoryPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  return (
    <Page menuWidth="200px" menuCloseWidth="80px" backgroundColor="transparent" menu={({ open }) => <LeftMenu baseUrl={baseUrl} open={open} />}>
      <History baseUrl={baseUrl} />
    </Page>
  );
});

export default HistoryPage;
