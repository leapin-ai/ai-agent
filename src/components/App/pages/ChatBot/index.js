import { createWithRemoteLoader } from '@kne/remote-loader';
import ChatBot from '@components/ChatBot';
import { useContext } from '../../context';
import style from '../style.module.scss';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';

const ChatBotPage = createWithRemoteLoader({
  modules: ['Layout@Page']
})(({ remoteModules }) => {
  const { baseUrl } = useContext();
  const [Page] = remoteModules;
  const [searchParams] = useSearchParams();
  return (
    <Page backgroundColor="transparent">
      <Breadcrumb
        className={style['breadcrumb']}
        items={[
          { title: <Link to={baseUrl}>My Agent</Link> },
          {
            title: <Link to={`${baseUrl}/detail?id=${searchParams.get('id')}`}>Hr Assistant</Link>
          },
          { title: '与Test的对话' }
        ]}
      />
      <ChatBot className={style['chat-bot']} baseUrl={baseUrl} />
    </Page>
  );
});

export default ChatBotPage;
