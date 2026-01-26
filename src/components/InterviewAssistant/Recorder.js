import { createWithRemoteLoader } from '@kne/remote-loader';
import { realtimeXfyun } from '@kne/speech-text';
import { App } from 'antd';
import { useState, useEffect, useRef } from 'react';
import useRefCallback from '@kne/use-ref-callback';

const Recorder = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, id, apis: currentApis, onProgress, onComplete, online, getSpeechInput, children }) => {
  const [usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const [currentMessage, setCurrentMessage] = useState({ type: 0, message: 'Ready' });
  const [recording, setRecording] = useState(false);
  const timerRef = useRef(null);
  const processHandler = useRefCallback(message => {
    onProgress && onProgress(message);
    setCurrentMessage({
      type: message.type,
      message: String(message.message).replace(/^[\s\u3000-\u303F\uFF00-\uFFEF!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+/, '')
    });
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentMessage(null);
    }, 3000);
  });
  const completeHandler = useRefCallback(onComplete);
  const { message } = App.useApp();

  const init = useRefCallback(() => {
    let promise;
    if (online && getSpeechInput) {
      Promise.resolve(getSpeechInput && getSpeechInput(processHandler)).then(() => {
        setRecording(true);
      });
    } else {
      promise = realtimeXfyun({
        workerUrl: apis.file.speechTextUrl,
        getToken: async () => {
          const { data: resData } = await ajax(
            Object.assign({}, currentApis.rtasrSign, {
              urlParams: { agent_id: id }
            })
          );
          if (resData.code !== 0) {
            throw new Error('get token Error');
          }
          console.log(resData.data);
          return resData.data;
        },
        onComplete: () => {
          setRecording(false);
          completeHandler();
        },
        onError: msg => {
          message.error(msg);
        },
        onProgress: processHandler
      });
      promise
        .then(({ start }) => start({ roleType: 2 }))
        .then(() => {
          setRecording(true);
        });
    }
    return promise;
  });
  useEffect(() => {
    const promise = init();

    return () => {
      promise && promise.then(({ stop }) => stop());
    };
  }, [init]);

  return children({ recording, message: currentMessage });
});

export default Recorder;
