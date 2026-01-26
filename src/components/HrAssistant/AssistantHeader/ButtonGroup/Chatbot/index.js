import { createWithRemoteLoader } from '@kne/remote-loader';
import { MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Chatbot = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton']
})(({ remoteModules, disabled, baseUrl, id, name }) => {
  const [usePreset, LoadingButton] = remoteModules;
  const { apis, ajax } = usePreset();
  const navigate = useNavigate();
  return (
    <LoadingButton
      disabled={disabled}
      type="primary"
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.chatBot.addSession, {
            data: {
              agent_id: id,
              title: `Test ${name} ChatBot`
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        navigate(`${baseUrl}/chat-bot-test?id=${id}&sessionId=${resData.data.id}`);
      }}
      icon={<MessageOutlined />}
    >
      Test Chat
    </LoadingButton>
  );
});

export default Chatbot;
