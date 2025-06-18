import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Result, Flex, Button, Alert, App } from 'antd';
import formatConferenceTime from './formatConferenceTime';
import style from './style.module.scss';

const ConferenceInfo = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:InfoPage', 'LoadingButton']
})(({ remoteModules, id }) => {
  const [usePreset, InfoPage, LoadingButton] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <Fetch
      loader={async ({ params }) => {
        const { data: signatureResData } = await ajax(Object.assign({}, apis.agent.getSignature));
        if (signatureResData.code !== 0) {
          throw new Error('获取签名失败');
        }
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.videoConference.getDetail, {
            params,
            headers: {
              ...signatureResData.data,
              appName: 'video-conference'
            }
          })
        );
        if (resData.code !== 0) {
          throw new Error('获取会议信息失败');
        }
        return resData.data;
      }}
      params={{ id }}
      error={error => {
        return <Result status="500" title="Error" subTitle={error} />;
      }}
      render={({ data }) => {
        let candidate, interviewer;
        data.members.forEach(member => {
          if (member.isMaster) {
            interviewer = member;
          } else {
            candidate = member;
          }
        });
        const candidateInfo = `    候选人您好，您有一场远程面试安排 
    名称：${data.name}
    时间：${formatConferenceTime({ startTime: data.startTime, duration: data.duration })}
    点击链接直接加入会议： https://staging.video-conf.unfolds.ai/detail?code=${candidate?.shorten}
          `;
        const interviewerInfo = `    面试官您好，您有一场远程面试安排 
    名称：${data.name}
    时间：${formatConferenceTime({ startTime: data.startTime, duration: data.duration })}
    点击链接直接加入会议： https://staging.video-conf.unfolds.ai/detail?code=${interviewer?.shorten}
          `;
        return (
          <InfoPage>
            <Alert message="请将对应的会议信息发送给候选人或者面试官，点击进入面试可以直接通过面试官身份进入面试会议" />
            <InfoPage.Part title="候选人会议信息">
              <div className={style['conference-info']}>{candidateInfo}</div>
              <Flex gap={16} justify="center">
                <LoadingButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(candidateInfo);
                    message.success('复制候选人会议信息成功');
                  }}>
                  复制候选人会议信息
                </LoadingButton>
              </Flex>
            </InfoPage.Part>

            <InfoPage.Part title="面试官会议信息">
              <div className={style['conference-info']}>{interviewerInfo}</div>
              <Flex gap={16} justify="center">
                <LoadingButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(interviewerInfo);
                    message.success('复制面试官会议信息成功');
                  }}>
                  复制面试官会议信息
                </LoadingButton>
                <Button
                  type="primary"
                  onClick={() => {
                    window.open(`https://staging.video-conf.unfolds.ai/detail?code=${interviewer?.shorten}`, '_blank');
                  }}>
                  进入面试
                </Button>
              </Flex>
            </InfoPage.Part>
          </InfoPage>
        );
      }}
    />
  );
});

export default ConferenceInfo;
