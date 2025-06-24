import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Badge } from 'antd';
import { useEffect, useState } from 'react';
import get from 'lodash/get';
import Fetch from '@kne/react-fetch';
import Recorder from './Recorder';
import useRefCallback from '@kne/use-ref-callback';
import Interview from './Interview';
import Message from './Message';

const InterviewAssistantContent = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, baseUrl, sessionId, agentId, apis, token, data, preparationInfo, operation, reload, setData, messageList, online = false, onStart, onComplete, getSpeechInput, getEndCallback }) => {
  const [usePreset] = remoteModules;
  const { ajax } = usePreset();
  const [stage, setStage] = useState(null);

  const endHandler = useRefCallback(async options => {
    const { ignoreComplete } = Object.assign({}, options);
    const { data: resData } = await ajax(
      Object.assign({}, apis.saveSession, {
        urlParams: { session_id: sessionId },
        params: { token },
        data: {
          status: 2
        }
      })
    );
    if (resData.code !== 0) {
      return;
    }
    !ignoreComplete && onComplete && onComplete();
  });

  useEffect(() => {
    getEndCallback && getEndCallback(() => endHandler({ ignoreComplete: true }));
  }, [endHandler]);

  return (
    <Message
      sessionId={sessionId}
      apis={apis}
      token={token}
      list={messageList}
      onMessage={outputData => {
        if (outputData?.user_content?.action === 'stage') {
          setStage(
            Object.assign({}, get(outputData, 'chatbot_content.data'), {
              success: !!get(outputData, 'chatbot_content.data'),
              advice: (get(outputData, 'chatbot_content.data.advice') || []).map((item, index) => {
                return Object.assign({}, item, {
                  id: `${outputData.id}-${index}`
                });
              })
            })
          );
          return;
        }
        const advice = get(outputData, 'chatbot_content.data.advice');

        if (advice && advice.length > 0) {
          setStage(stage => {
            return Object.assign({}, stage, {
              advice: (advice || []).map((item, index) => {
                return Object.assign({}, item, {
                  id: `${outputData.id}-${index}`
                });
              })
            });
          });
          return;
        }
      }}>
      {({ start, sendMessage }) => {
        return (
          <Interview
            className={className}
            resume={data.resume}
            jd={data.jd}
            preparationInfo={preparationInfo}
            list={data.stages}
            jobTitle={data.jobTitle}
            stage={stage}
            reload={reload}
            operation={operation}
            onOperation={async ({ action, target }) => {
              const stageAction = [
                ...(get(operation, 'stageAction') || []).filter(item => {
                  return item.target.id !== target.id;
                }),
                {
                  action,
                  stage: stage.stage,
                  target,
                  time: new Date()
                }
              ];

              const { data: resData } = await ajax(
                Object.assign({}, apis.saveSession, {
                  urlParams: { session_id: sessionId },
                  params: { token },
                  data: {
                    operation_history: Object.assign({}, operation, {
                      stageAction
                    })
                  }
                })
              );
              if (resData.code !== 0) {
                return;
              }
              if (['pin', 'delete'].indexOf(action) > -1) {
                await sendMessage(Object.assign({}, { question: target.text }, { action: 'question' }));
              }
              reload();
            }}
            recorder={callback => {
              return (
                <Recorder
                  online={online}
                  getSpeechInput={getSpeechInput}
                  id={sessionId}
                  apis={apis}
                  onProgress={message => {
                    sendMessage(Object.assign({}, message, { action: 'message' }));
                  }}>
                  {({ recording, message }) => {
                    const colors = ['green', 'pink', 'red', 'yellow', 'orange', 'cyan', 'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'];
                    return callback({
                      ready: recording,
                      text: message && message.message && (
                        <Flex gap={4} align="center">
                          <Badge color={Number.isInteger(message.type) ? colors[message.type] : 'green'} />
                          <span className="message">{message.message}</span>
                        </Flex>
                      )
                    });
                  }}
                </Recorder>
              );
            }}
            isContinue={messageList && messageList.length > 0}
            onStart={() => {
              start();
              onStart && onStart();
            }}
            onStageChange={async stage => {
              const stageOperation = [
                ...(get(operation, 'stageOperation') || []),
                {
                  stage: stage.value,
                  time: new Date()
                }
              ];
              setData(data => {
                return Object.assign({}, data, {
                  operation_history: Object.assign({}, data.operation_history, { stageOperation })
                });
              });
              const { data: resData } = await ajax(
                Object.assign({}, apis.saveSession, {
                  urlParams: { session_id: sessionId },
                  params: { token },
                  data: {
                    operation_history: Object.assign({}, operation, {
                      stageOperation
                    })
                  }
                })
              );
              if (resData.code !== 0) {
                await reload();
                return;
              }
              setStage(null);
              await sendMessage(Object.assign({}, { stage: stage.value }, { action: 'stage' }));
            }}
            onComplete={endHandler}
          />
        );
      }}
    </Message>
  );
});

const InterviewAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, apiName, id, baseUrl, token, getOpenApi, ...props }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const currentApis = apis.agent[apiName];

  return (
    <Fetch
      {...Object.assign({}, currentApis.getSessionDetail, {
        urlParams: { session_id: id },
        params: { token }
      })}
      render={({ data, reload, setData }) => {
        return (
          <InterviewAssistantContent
            {...props}
            token={token}
            className={className}
            apis={currentApis}
            sessionId={data.id}
            baseUrl={baseUrl}
            reload={reload}
            setData={setData}
            data={get(data, 'extra_info.data')}
            operation={get(data, 'operation_history')}
            preparationInfo={get(data, 'preparation_info.guide')}
            isEnd={data.status === 2}
            messageList={data.messages}
            agentId={data.agent.id}
            getOpenApi={getOpenApi}
          />
        );
      }}
    />
  );
});

export default InterviewAssistant;
