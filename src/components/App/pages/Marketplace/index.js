import { createWithRemoteLoader } from '@kne/remote-loader';
import Marketplace from '@components/Marketplace';
import { useContext } from '../../context';
import style from '../style.module.scss';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import LeftMenu from '@components/LeftMenu';

const MarketplacePage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  return (
    <Page menuWidth="200px" menuCloseWidth="80px" backgroundColor="transparent" menu={({ open }) => <LeftMenu baseUrl={baseUrl} open={open} />}>
      <Breadcrumb className={style['breadcrumb']} items={[{ title: <Link to={baseUrl}>My Agent</Link> }, { title: 'Marketplace' }]} />
      <Marketplace baseUrl={baseUrl} />
    </Page>
  );
});

export default MarketplacePage;
