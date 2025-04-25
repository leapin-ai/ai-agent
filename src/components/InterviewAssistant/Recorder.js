import { createWithRemoteLoader, getPublicPath } from '@kne/remote-loader';
import { realtimeXfyun } from '@kne/speech-text';
import { Spin, App } from 'antd';
import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import useRefCallback from '@kne/use-ref-callback';

const Recorder = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, id, apis: currentApis, onProgress, onComplete }) => {
  const [usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const [recording, setRecording] = useState(false);
  const processHandler = useRefCallback(onProgress);
  const completeHandler = useRefCallback(onComplete);
  const { message } = App.useApp();
  useEffect(() => {
    const promise = realtimeXfyun({
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

    return () => {
      promise.then(({ stop }) => stop());
    };
  }, [processHandler, completeHandler, message]);

  return recording ? <DotLottieReact className={className} src={`${getPublicPath('leapin-ai-agent') + '/voice.json'}`} loop autoplay /> : <Spin />;
});

export default Recorder;
