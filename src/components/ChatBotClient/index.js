import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Navigate, useSearchParams } from 'react-router-dom';
import ChatBot from '@components/ChatBot';
import style from './style.module.scss';

const ChatBotClient = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl, code, error }) => {
  const [usePreset] = remoteModules;
  const [searchParams] = useSearchParams();
  const { apis } = usePreset();
  return (
    <Fetch
      {...Object.assign({}, apis.agent.chatBotClient.getTokenByCode, {
        data: {
          code: code || searchParams.get('code')
        }
      })}
      error={error || <Navigate to={`${baseUrl}/error`} />}
      render={({ data }) => {
        return <ChatBot className={style['chat-bot']} id={data.session?.id} token={data.token} apiName="chatBotClient" />;
      }}
    />
  );
});

export default ChatBotClient;
