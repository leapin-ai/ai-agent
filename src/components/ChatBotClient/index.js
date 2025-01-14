import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Navigate, useSearchParams } from 'react-router-dom';
import ChatBot from '@components/ChatBot';

const ChatBotClient = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl }) => {
  const [usePreset] = remoteModules;
  const [searchParams] = useSearchParams();
  const { apis } = usePreset();
  return (
    <Fetch
      {...Object.assign({}, apis.agent.chatBotClientByCode, {
        data: {
          code: searchParams.get('code')
        }
      })}
      error={<Navigate to={`${baseUrl}/error`} />}
      render={({ data }) => {
        return <ChatBot id={data.session?.id} />;
      }}
    />
  );
});

export default ChatBotClient;
