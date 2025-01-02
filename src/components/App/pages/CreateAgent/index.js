import { createWithRemoteLoader } from '@kne/remote-loader';
import CreateAgent from '@components/CreateAgent';
import { useContext } from '../../context';
import style from '../style.module.scss';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';

const CreateAgentPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const [Page] = remoteModules;
  const { baseUrl } = useContext();
  return (
    <Page backgroundColor="transparent">
      <Breadcrumb className={style['breadcrumb']} items={[{ title: <Link to={baseUrl}>My Agent</Link> }, { title: 'Create My Agents' }]} />
      <CreateAgent baseUrl={baseUrl} />
    </Page>
  );
});

export default CreateAgentPage;
