import { createWithRemoteLoader } from '@kne/remote-loader';
import HrAssistant from '@components/HrAssistant';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { useContext } from '../../context';
import style from '../style.module.scss';

const HrAssistantPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  return (
    <Page backgroundColor="transparent">
      <Breadcrumb className={style['breadcrumb']} items={[{ title: <Link to={baseUrl}>My Agent</Link> }, { title: 'Hr Assistant' }]} />
      <HrAssistant baseUrl={baseUrl} />
    </Page>
  );
});

export default HrAssistantPage;
