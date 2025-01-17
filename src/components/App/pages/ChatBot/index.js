import { createWithRemoteLoader } from '@kne/remote-loader';
import ChatBot from '@components/ChatBot';
import { useContext } from '../../context';
import style from '../style.module.scss';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import LeftMenu from '@components/LeftMenu';

const ChatBotPage = createWithRemoteLoader({
  modules: ['components-core:Layout@Page']
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
          { title: 'ChatBot' }
        ]}
      />
      <ChatBot className={style['chat-bot']} baseUrl={baseUrl} apiName="chatBot" id={searchParams.get('sessionId')} />
    </Page>
  );
});

export default ChatBotPage;
