import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Input, App } from 'antd';
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
  const [evening, setEvening] = useState(false);
  const [list, setList] = useState(messageList || []);
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messageListRef = useRef(null);
  const inputTimer = useRef(null);
  const inputRef = useRef(null);
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
    setEvening(true);
    const prevMessageId = last(list.filter(({ event }) => event !== 'error'))?.id;
    await ajax.sse(
      Object.assign({}, apis.sendSessionMessageStream, {
        urlParams: { session_id: sessionId },
        data:
          type === 'condition'
            ? {
                type,
                user_selection: [value],
                chat_message_id: prevMessageId
              }
            : {
                type,
                user_content: value,
                chat_message_id: prevMessageId
              },
        eventEmit: data => {
          setList(list => {
            const newList = list.slice(0);
            const index = newList.findIndex(({ id }) => id === data.id);

            if (index === -1) {
              newList.push(data);
            } else {
              newList.splice(
                index,
                1,
                Object.assign({}, newList[index], data, {
                  chatbot_content: (newList[index].chatbot_content || '') + (data.chatbot_content || '')
                })
              );
            }
            return newList;
          });
        }
      })
    );
    setLoading(false);
    setCurrentMessage('');
    setEvening(false);
    inputRef.current && inputRef.current.focus();
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
          <Flex gap={8} flex={1}>
            <Flex flex={0}>
              <Image.Avatar src={agentAvatar || defaultAvatar} size={54} />
            </Flex>
            <Flex flex={1} vertical justify="center">
              <div className={style['title-content']}>{sessionName || 'Conversations'}</div>
              {!isEnd && (
                <div className={style['title-time']}>
                  <Countdown time={lastTime} onComplete={endHandler} />
                </div>
              )}
            </Flex>
          </Flex>
          <Flex>
            {!isEnd ? (
              <LoadingButton type="primary" shape="round" onClick={endHandler}>
                End
              </LoadingButton>
            ) : (
              <div className={style['over-tips']}>Session's over</div>
            )}
          </Flex>
        </Flex>
      </div>
      <SimpleBar
        className={classnames(style['message-list-outer'], 'message-list-scroller', {
          [style['is-end']]: isEnd
        })}
        scrollableNodeProps={{ ref: messageListRef }}
      >
        <MessageList
          isEnd={isEnd}
          agentAvatar={agentAvatar}
          list={list}
          startTime={startTime}
          currentMessage={loading && currentMessage}
          onResend={data => {
            sendMessage({ type: data.type, value: data.user_content });
          }}
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
                  ref={inputRef}
                  onCompositionStart={() => {
                    setIsComposing(true);
                    inputTimer.current && clearTimeout(inputTimer.current);
                  }}
                  onCompositionEnd={() => {
                    inputTimer.current = setTimeout(() => {
                      setIsComposing(false);
                    }, 300);
                  }}
                  disabled={loading || evening}
                  className={style['message-input']}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  placeholder="Ask Elsa..."
                  value={currentMessage}
                  onChange={e => {
                    setCurrentMessage(e.target.value);
                  }}
                  onKeyUp={e => {
                    if (e.key === 'Enter' && !isComposing) {
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
                  loading={loading || evening}
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
