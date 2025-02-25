import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Input, Space, App } from 'antd';
import { useState, useEffect, useRef } from 'react';
import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import last from 'lodash/last';
import MessageList from './MessageList';
import useRefCallback from '@kne/use-ref-callback';
import defaultAvatar from '../../common/defaultAvatar.png';
import enter from './enter.png';
import style from './style.module.scss';
import get from 'lodash/get';
import CheckList from './CheckList';
import Countdown from './Countdown';

const ChartBotMessage = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset', 'components-core:Common@SimpleBar', 'components-core:Image']
})(({ remoteModules, messageList, agentId, agentAvatar, sessionId, sessionName, startTime, lastTime, apis, onComplete, className, isEnd }) => {
  const [LoadingButton, usePreset, SimpleBar, Image] = remoteModules;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(messageList || []);
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const messageListRef = useRef(null);
  const endHandler = useRefCallback(async () => {
    const { data: resData } = await ajax(
      Object.assign({}, apis.saveSession, {
        urlParams: { session_id: sessionId },
        data: {
          status: 2
        }
      })
    );
    if (resData.code !== 0) {
      return;
    }
    message.success('Success');
    onComplete && onComplete();
  });

  useEffect(() => {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [list, loading]);
  const sendMessage = useRefCallback(async ({ type, value }) => {
    setLoading(true);
    const { data: resData } = await ajax(
      Object.assign({}, apis.sendSessionMessage, {
        urlParams: { session_id: sessionId },
        data:
          type === 'condition'
            ? {
                type,
                user_selection: [value],
                chat_message_id: last(list)?.id
              }
            : {
                type,
                user_content: value,
                chat_message_id: last(list)?.id
              }
      })
    );
    setLoading(false);
    if (resData.code !== 0) {
      return;
    }
    setList(list => {
      const newList = list.slice(0);
      newList.push(resData.data);
      return newList;
    });
    setCurrentMessage('');
  });
  useEffect(() => {
    if (list.length === 0) {
      sendMessage({ value: '' });
    } else {
      setLoading(false);
    }
  }, [list, sendMessage]);
  return (
    <Flex vertical className={classnames(className, style['chat'])} gap={8}>
      <div className={style['title']}>
        <Flex className={style['title-inner']} justify="space-between" align="center">
          <Space>
            <Image.Avatar src={agentAvatar || defaultAvatar} size={54} />
            <div>{sessionName || 'Conversations'}</div>
          </Space>
          {!isEnd ? (
            <>
              <div className={style['title-time']}>
                <Countdown time={lastTime} onComplete={endHandler} />
              </div>
              <LoadingButton type="primary" shape="round" onClick={endHandler}>
                End
              </LoadingButton>
            </>
          ) : (
            <div className={style['over-tips']}>Session's over</div>
          )}
        </Flex>
      </div>
      <SimpleBar
        className={classnames(style['message-list-outer'], 'message-list-scroller', {
          [style['is-end']]: isEnd
        })}
        scrollableNodeProps={{ ref: messageListRef }}
      >
        <MessageList
          agentAvatar={agentAvatar}
          list={list}
          startTime={startTime}
          currentMessage={loading && currentMessage}
          onConditionChange={item => {
            setCurrentMessage(item.label);
            sendMessage({ type: 'condition', value: item });
          }}
        />
      </SimpleBar>
      {!isEnd && (
        <div className={style['footer']}>
          {get(last(list), 'type') === 'condition' ? (
            <div className={style['message-input-checklist']}>
              <CheckList
                loading={loading}
                options={last(list).options || []}
                onChange={item => {
                  setCurrentMessage(item.label);
                  sendMessage({ type: 'condition', value: item });
                }}
              />
            </div>
          ) : (
            <div className={style['message-input-border']}>
              <Flex className={style['message-input-outer']}>
                <Input.TextArea
                  disabled={loading}
                  className={style['message-input']}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  placeholder="Chat with a robot"
                  value={currentMessage}
                  onChange={e => {
                    setCurrentMessage(e.target.value);
                  }}
                  onKeyUp={e => {
                    if (e.key === 'Enter') {
                      const msg = currentMessage.trim();
                      setCurrentMessage(msg);
                      if (msg.length === 0) {
                        message.warning('The content sent cannot be empty');
                        return;
                      }
                      return sendMessage({ type: 'text', value: msg });
                    }
                  }}
                />
                <LoadingButton
                  className={style['message-sender']}
                  type="primary"
                  loading={loading}
                  icon={<img src={enter} alt="enter" />}
                  onClick={async () => {
                    const msg = currentMessage.trim();
                    if (msg.length === 0) {
                      message.warning('The content sent cannot be empty');
                      return;
                    }
                    return sendMessage({ type: 'text', value: msg.trim() });
                  }}
                />
              </Flex>
            </div>
          )}
        </div>
      )}
    </Flex>
  );
});

const ChartBot = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, apiName, id, baseUrl, onComplete }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const currentApis = apis.agent[apiName];
  return (
    <Fetch
      {...Object.assign({}, currentApis.getSessionDetail, {
        urlParams: { session_id: id }
      })}
      render={({ data, reload }) => {
        return (
          <ChartBotMessage
            className={className}
            apis={currentApis}
            sessionId={data.id}
            startTime={data.start_time}
            sessionName={data.session_name}
            baseUrl={baseUrl}
            onComplete={() => {
              reload();
            }}
            lastTime={data.countdown_time}
            isEnd={data.status === 2}
            messageList={data.messages}
            agentId={data.agent_application.id}
            agentAvatar={get(data, 'agent_application.agent.avatar')}
          />
        );
      }}
    />
  );
});

export default ChartBot;

export { MessageList };
