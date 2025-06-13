import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams } from 'react-router-dom';
import Fetch from '@kne/react-fetch';
import InterviewAssistant from './InterviewAssistant';
import { Result } from 'antd';
import InterviewInfo from './InterviewInfo';
import get from 'lodash/get';

const InterviewAssistantClient = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, code, conferenceStep, onSpeechStart, onSpeechEnd, getSpeechInput, ...props }) => {
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
      error={error => {
        return <Result status="500" title="Error" subTitle={error} />;
      }}
      render={({ data, reload }) => {
        if (conferenceStep === 'waiting') {
          return <InterviewInfo active="preparation" reload={reload} jd={get(data, 'session.extra_info.data.jd')} resume={get(data, 'session.extra_info.data.resume')} preparationInfo={get(data, 'session.preparation_info.guide')} />;
        }
        return (
          <InterviewAssistant
            {...props}
            id={data.session?.id}
            token={data.token}
            onStart={onSpeechStart}
            onComplete={onSpeechEnd}
            getSpeechInput={processHandler => {
              return getSpeechInput(message => {
                processHandler({
                  type: message.member.isMaster ? 'interviewer' : 'candidate',
                  message: message.message
                });
              });
            }}
            apiName="chatBotClient"
            online
          />
        );
      }}
    />
  );
});

export default InterviewAssistantClient;
