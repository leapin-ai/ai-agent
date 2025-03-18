import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Input, App, Row, Col, Splitter, Empty } from 'antd';
import { useState, useEffect, useRef, useMemo } from 'react';
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
import markdown from 'markdown-it';

const md = markdown();

const transformHTML = html => {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  const links = dom.querySelectorAll('a');
  let videoAutoplay = true;
  [].slice.call(links, 0).map(link => {
    if (/\.(mp4|webm|ogv)$/i.test(link.href)) {
      const video = document.createElement('video');
      video.setAttribute('src', link.href);
      if (videoAutoplay) {
        video.setAttribute('autoplay', '');
        videoAutoplay = false;
      }
      video.setAttribute('controls', '');
      link.replaceWith(video);
      return;
    }
    if (/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(link.href)) {
      const img = document.createElement('img');
      img.setAttribute('src', link.href);
      link.replaceWith(img);
      return;
    }
    link.setAttribute('target', '_blank');
  });

  return dom.innerHTML;
};

const ChartBotMessage = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset', 'components-core:Common@SimpleBar', 'components-core:Image']
})(({ remoteModules, messageList, agentId, agentAvatar, sessionId, sessionName, startTime, lastTime, apis, onComplete, className, isEnd, openSide, token }) => {
  const [LoadingButton, usePreset, SimpleBar, Image] = remoteModules;
  const [loading, setLoading] = useState(true);
  const [evening, setEvening] = useState(false);
  const [list, setList] = useState(messageList || []);
  const [sideMessage, setSideMessage] = useState('');
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messageListRef = useRef(null);
  const [sizes, setSizes] = useState(['50%', '50%']);
  const inputTimer = useRef(null);
  const inputRef = useRef(null);
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
        params: { token },
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

  const getSideInfo = useRefCallback(async message => {
    if (!openSide) {
      return;
    }
    const { data: resData } = await ajax(
      Object.assign({}, apis.getSideInfo, {
        urlParams: { agent_id: agentId },
        params: { user_content: message, token }
      })
    );

    if (resData.code !== 0) {
      return;
    }
    setSideMessage(resData.data.text);
  });

  const sideMessageHTML = useMemo(() => {
    return sideMessage ? transformHTML(md.render(sideMessage)) : '';
  }, [sideMessage]);

  useEffect(() => {
    if (!sideMessage && messageList.length === 0) {
      getSideInfo('greeting');
      return;
    }
    if (!sideMessage && messageList.length > 0) {
      getSideInfo(last(messageList).user_content);
      return;
    }
  }, [messageList, sideMessage, getSideInfo]);

  useEffect(() => {
    if (list.length === 0) {
      sendMessage({ value: '' });
    } else {
      setLoading(false);
    }
  }, [list, sendMessage]);

  const botBody = (
    <Flex vertical gap={8} className={style['bot-body']}>
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
                      getSideInfo(msg);
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

  return (
    <Flex vertical className={classnames(className, style['chat'])}>
      <div className={style['title']}>
        <Flex className={style['title-inner']} justify="space-between" align="center">
          <Flex gap={8} flex={1}>
            <Flex flex={0}>
              <Image.Avatar src={agentAvatar || defaultAvatar} size={54} />
            </Flex>
            <Flex flex={1} vertical justify="center">
              <div className={style['title-content']}>{sessionName || 'Conversations'}</div>
              {!isEnd && lastTime && (
                <div className={style['title-time']}>
                  <Countdown time={lastTime} onComplete={endHandler} />
                </div>
              )}
            </Flex>
          </Flex>
          <Flex>
            {lastTime &&
              (!isEnd ? (
                <LoadingButton type="primary" shape="round" onClick={endHandler}>
                  End
                </LoadingButton>
              ) : (
                <div className={style['over-tips']}>Session's over</div>
              ))}
          </Flex>
        </Flex>
      </div>
      {openSide ? (
        <Splitter onResize={setSizes}>
          <Splitter.Panel size={!sideMessage ? '0%' : sizes[0]}>
            {sideMessage ? (
              <SimpleBar className={classnames(style['side-content-outer'], 'side-content-outer')}>
                <div
                  className={style['side-content']}
                  dangerouslySetInnerHTML={{
                    __html: sideMessageHTML
                  }}
                ></div>
              </SimpleBar>
            ) : (
              <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Empty />
              </Flex>
            )}
          </Splitter.Panel>
          <Splitter.Panel size={!sideMessage ? '100%' : sizes[1]}>{botBody}</Splitter.Panel>
        </Splitter>
      ) : (
        botBody
      )}
    </Flex>
  );
});

const ChartBot = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, className, apiName, id, baseUrl, token, onComplete }) => {
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
          <ChartBotMessage
            token={token}
            className={className}
            apis={currentApis}
            sessionId={data.id}
            startTime={data.start_time}
            sessionName={data.session_name}
            baseUrl={baseUrl}
            onComplete={() => {
              reload();
            }}
            openSide={data.agent.slave_agents && data.agent.slave_agents.length > 0 && document.documentElement.clientWidth >= 600}
            lastTime={data.countdown_time}
            isEnd={data.status === 2}
            messageList={data.messages}
            agentId={data.agent.id}
            agentAvatar={get(data, 'agent_application.agent.avatar')}
          />
        );
      }}
    />
  );
});

export default ChartBot;

export { MessageList };
