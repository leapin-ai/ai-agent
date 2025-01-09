import { createWithRemoteLoader } from '@kne/remote-loader';
import CreateAgent from '@components/CreateAgent';
import { useContext } from '../../context';
import style from '../style.module.scss';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import LeftMenu from '@components/LeftMenu';

const CreateAgentPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const [Page] = remoteModules;
  const { baseUrl } = useContext();
  return (
    <Page menuWidth="200px" menuCloseWidth="80px" backgroundColor="transparent" menu={({ open }) => <LeftMenu baseUrl={baseUrl} open={open} />}>
      <Breadcrumb className={style['breadcrumb']} items={[{ title: <Link to={baseUrl}>My Agent</Link> }, { title: 'Create My Agents' }]} />
      <CreateAgent baseUrl={baseUrl} />
    </Page>
  );
});

export default CreateAgentPage;
