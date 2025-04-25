import { createWithRemoteLoader } from '@kne/remote-loader';
import InterviewAssistant from '@components/InterviewAssistant';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { useContext } from '../../context';
import LeftMenu from '@components/LeftMenu';
import style from '../style.module.scss';

const HrAssistantPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  const [searchParams] = useSearchParams();
  return (
    <Page menuWidth="200px" menuCloseWidth="80px" backgroundColor="transparent" menu={({ open }) => <LeftMenu baseUrl={baseUrl} open={open} />}>
      <Breadcrumb
        className={style['breadcrumb']}
        items={[
          { title: <Link to={baseUrl}>My Agent</Link> },
          {
            title: <Link to={`${baseUrl}/detail?id=${searchParams.get('id')}`}>Agent Detail</Link>
          },
          { title: 'Interview Assistant' }
        ]}
      />
      <InterviewAssistant baseUrl={baseUrl} apiName="chatBot" id={searchParams.get('sessionId')} />
    </Page>
  );
});

export default HrAssistantPage;
