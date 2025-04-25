import { createWithRemoteLoader } from '@kne/remote-loader';
import { Splitter, Flex, Space } from 'antd';
import localStorage from '@kne/local-storage';
import style from './style.module.scss';
import { useState } from 'react';
import { Timer } from '@kne/count-down';
import get from 'lodash/get';
import Fetch from '@kne/react-fetch';
import Recorder from './Recorder';
import Message from './Message';
import classnames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import { ReactComponent as TipsIcon } from './tips.svg';
import useRefCallback from '@kne/use-ref-callback';
import { useNavigate } from 'react-router-dom';

const LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES = 'LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES';

const InterviewAssistantContent = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:StateBar', 'components-core:LoadingButton', 'components-core:FilePreview', 'components-ckeditor:Editor.Content', 'components-core:Common@SimpleBar']
})(({ remoteModules, baseUrl, sessionId, agentId, apis, token, data }) => {
  const [usePreset, StateBar, LoadingButton, FilePreview, EditorContent, SimpleBar] = remoteModules;
  const [contentTab, setContentTab] = useState('resume');
  const [start, setStart] = useState(false);
  const [sizes, setSizes] = useState(localStorage.getItem(LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES) || ['50%', '50%']);
  const { ajax } = usePreset();
  const navigate = useNavigate();
  const endHandler = useRefCallback(async () => {
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
    navigate(`${baseUrl}/detail?id=${agentId}`);
  });

  return (
    <Splitter
      className={style['container']}
      onResize={sizes => {
        localStorage.setItem(LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES, sizes);
        setSizes(sizes);
      }}
    >
      <Splitter.Panel size={sizes[0]}>
        <StateBar
          activeKey={contentTab}
          onChange={setContentTab}
          stateOption={[
            { tab: 'Resume', key: 'resume' },
            { tab: 'JD', key: 'jd' }
          ]}
        />
        <SimpleBar className={style['scroller']}>
          {contentTab === 'resume' && <FilePreview src={get(data, 'resume.src')} />}
          {contentTab === 'jd' && <EditorContent>{get(data, 'jd')}</EditorContent>}
        </SimpleBar>
      </Splitter.Panel>
      <Splitter.Panel size={sizes[1]}>
        <Flex vertical gap={24} className={style['container-right']}>
          <Flex justify="center" className={style['header']}>
            {start ? (
              <Flex justify="space-between" flex={1} align="center">
                <div className={style['header-text']}>
                  <Timer />
                </div>
                <LoadingButton
                  type="primary"
                  shape="round"
                  onClick={async () => {
                    setStart(false);
                    await endHandler();
                  }}
                >
                  End
                </LoadingButton>
              </Flex>
            ) : (
              <span className={style['header-text']}>Ready</span>
            )}
          </Flex>
          <Flex justify="center" align="center" flex={1}>
            {start ? (
              <div className={style['right-content']}>
                <Message sessionId={sessionId} token={token} apis={apis}>
                  {({ sendMessage, list }) => {
                    return (
                      <Flex vertical gap={24}>
                        <Flex justify="center">
                          <Recorder
                            className={classnames(style['recorder'], {
                              [style['has-message']]: list?.length > 1
                            })}
                            id={agentId}
                            apis={apis}
                            onProgress={data => {
                              sendMessage(data);
                            }}
                            onComplete={() => {
                              setStart(false);
                            }}
                          />
                        </Flex>
                        <SimpleBar
                          className={classnames(style['result-scroller'], {
                            [style['has-message']]: list?.length > 1
                          })}
                        >
                          <QueueAnim className={style['queue-anim']} duration={1000} interval={500} type={['top', 'bottom']}>
                            {list.map(({ id, content }) => {
                              return (
                                <div key={id} className={style['card-item']}>
                                  <div className={style['card-slider']}>
                                    <TipsIcon />
                                  </div>
                                  <div className={style['card-content']}>{content}</div>
                                </div>
                              );
                            })}
                          </QueueAnim>
                        </SimpleBar>
                      </Flex>
                    );
                  }}
                </Message>
              </div>
            ) : (
              <LoadingButton
                type="primary"
                shape="round"
                onClick={() => {
                  setStart(true);
                }}
              >
                Start Interview
              </LoadingButton>
            )}
          </Flex>
        </Flex>
      </Splitter.Panel>
    </Splitter>
  );
});

const InterviewAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, apiName, id, baseUrl, token, getOpenApi }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const currentApis = apis.agent[apiName];

  return (
    <Fetch
      {...Object.assign({}, currentApis.getSessionDetail, {
        urlParams: { session_id: id },
        params: { token }
      })}
      render={({ data, reload }) => {
        return (
          <InterviewAssistantContent
            token={token}
            className={className}
            apis={currentApis}
            sessionId={data.id}
            baseUrl={baseUrl}
            onComplete={() => {
              reload();
            }}
            data={get(data, 'extra_info.data')}
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
