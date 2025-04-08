import { createWithRemoteLoader } from '@kne/remote-loader';
import { speechTextRealTime } from '@kne/speech-text';
import { useEffect, useRef, useState } from 'react';
import { App, Flex, Button } from 'antd';
import localStorage from '@kne/local-storage';

const Record = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, agentId, onChange, onComplete }) => {
  const [usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const [currentMessage, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const { message } = App.useApp();
  const recordRef = useRef(null);
  useEffect(() => {
    recordRef.current = speechTextRealTime({
      getToken: async () => {
        const token = await localStorage.cache('LEAPIN_AGENT_SPEECH_TOKEN', async () => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.agent.chatBotClient.getSpeechToken, {
              urlParams: { agent_id: agentId }
            })
          );
          if (resData.code !== 0) {
            return null;
          }
          const { app_key, expire_time, token } = resData.data;
          return { appKey: app_key, token, expire: expire_time * 1000 };
        });
        if (!token) {
          onComplete();
          return;
        }
        return token;
      },
      onChange: ({ message }) => {
        onChange(message);
        setMessage(message);
      },
      onError: msg => {
        message.error(msg);
      }
    });
    recordRef.current.then(({ start }) => {
      start();
      setRecording(true);
    });
  }, []);
  return (
    <Flex vertical>
      <Flex justify="flex-end" gap={10}>
        {currentMessage && (
          <Button
            shape="round"
            type="primary"
            size="small"
            onClick={() => {
              onComplete(currentMessage);
              setMessage('');
              recordRef.current.then(({ stop }) => {
                stop();
                setRecording(false);
              });
            }}
          >
            Send
          </Button>
        )}
        <Button
          shape="round"
          type="text"
          size="small"
          onClick={() => {
            onComplete();
            setMessage('');
            recordRef.current.then(({ stop }) => {
              stop();
              setRecording(false);
            });
          }}
        >
          Cancel
        </Button>
      </Flex>
      {currentMessage || (recording ? 'Please speak to me...' : 'Please wait...')}
    </Flex>
  );
});

export default Record;
