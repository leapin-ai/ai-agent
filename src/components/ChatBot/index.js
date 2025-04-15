import { createWithRemoteLoader, getPublicPath } from '@kne/remote-loader';
import { Flex, Input, App, Spin, Splitter, Button, Card, Typography } from 'antd';
import { useState, useEffect, useRef, useMemo } from 'react';
import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import last from 'lodash/last';
import first from 'lodash/first';
import MessageList from './MessageList';
import useRefCallback from '@kne/use-ref-callback';
import { AudioFilled } from '@ant-design/icons';
import defaultAvatar from '../../common/defaultAvatar.png';
import enter from './enter.png';
import style from './style.module.scss';
import get from 'lodash/get';
import CheckList from './CheckList';
import Countdown from './Countdown';
import MarkdownRender from '@kne/markdown-components-render';
import sse from '@root/common/sse';
import localStorage from '@kne/local-storage';
import QueueAnim from 'rc-queue-anim';
import Record from './Record';

const JobCard = createWithRemoteLoader({
  modules: ['components-core:InfoPage']
})(({ remoteModules, title, link, children }) => {
  const [InfoPage] = remoteModules;
  return (
    <InfoPage className={style['job-card']}>
      <InfoPage.Part title={title}>{children}</InfoPage.Part>
      <InfoPage>
        <Flex justify="flex-end">
          <Button shape="round" target="_blank" href={link} type="primary">
            Apply
          </Button>
        </Flex>
      </InfoPage>
    </InfoPage>
  );
});

const transformHTML = html => {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  //获取所有a链接和.yaml-components节点，其他删掉
  const results = [];
  const links = dom.querySelectorAll('a');
  [].slice.call(links, 0).forEach(link => {
    if (/\.(mp4|webm|ogv)$/i.test(link.href)) {
      const video = document.createElement('video');
      video.setAttribute('src', link.href);
      video.setAttribute('controls', '');
      results.push(video);
    }
    if (/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(link.href)) {
      const img = document.createElement('img');
      img.setAttribute('src', link.href);
      results.push(img);
    }
  });

  const medias = dom.querySelectorAll('img,video');

  [].slice.call(medias, 0).forEach(media => {
    results.push(media);
  });

  const components = dom.querySelectorAll('.yaml-components');
  results.push(...[].slice.call(components, 0));
  return results.map(element => element.outerHTML);
};

const SideMessage = ({ messages }) => {
  const ref = useRef(null);
  const contentRef = useRef({ output: '', index: -1 });
  const [visibleFirst, setVisibleFirst] = useState(false);
  const content = useMemo(() => {
    return get(last(messages), 'chatbot_content') || '';
  }, [messages]);

  const render = (content, index) => {
    return (
      <MarkdownRender
        htmlTransform={transformHTML}
        components={{
          Card,
          JobCard
        }}
        render={output => {
          if (output && output.length > 0) {
            contentRef.current = { output, index };
          }
          setVisibleFirst(!(contentRef.current && contentRef.current.output && contentRef.current.output.length > 0));
          return (
            <QueueAnim
              duration={1000}
              interval={500}
              type={['top', 'bottom']}
              onEnd={() => {
                const video = ref.current.querySelectorAll('video');
                [].slice.call(video, 0).forEach(video => {
                  video.muted = true;
                  video.play();
                });
              }}
            >
              {contentRef.current &&
                contentRef.current.output &&
                contentRef.current.output.map((node, index) => {
                  return <div key={`${contentRef.current.index}-${index}`}>{node}</div>;
                })}
            </QueueAnim>
          );
        }}
      >
        {content}
      </MarkdownRender>
    );
  };

  return (
    <div className={style['side-content']} ref={ref}>
      {visibleFirst ? <div key="first">{render(get(first(messages), 'chatbot_content') || '', 0)}</div> : <div key="content">{render(content, messages.length - 1)}</div>}
    </div>
  );
};

const ChartBotMessage = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset', 'components-core:Common@SimpleBar', 'components-core:Image']
})(({ remoteModules, messageList, agentId, agentAvatar, sessionId, sessionName, startTime, lastTime, apis, onComplete, className, isEnd, openSide, token, getOpenApi }) => {
  const [LoadingButton, usePreset, SimpleBar, Image] = remoteModules;
  const [loading, setLoading] = useState(true);
  const [evening, setEvening] = useState(false);
  const [list, setList] = useState(messageList || []);
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messageListRef = useRef(null);
  const [sizes, setSizes] = useState(localStorage.getItem('LEAPIN_AI_AGENT_WINDOW_SIZES') || ['70%', '30%']);
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
    onComplete && onComplete();
  });
  const [isRecord, setIsRecord] = useState(false);

  const setOpenApi = useRefCallback(() => {
    getOpenApi &&
      getOpenApi({
        end: endHandler,
        sessionId
      });
  });

  useEffect(() => {
    setOpenApi();
  }, []);

  useEffect(() => {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [list, loading]);
  const sendMessage = useRefCallback(async ({ type, value }) => {
    setLoading(true);
    setEvening(true);
    const prevMessageId = last(list.filter(({ event }) => event !== 'error'))?.id;

    const sseOptions = Object.assign({}, apis.sendSessionMessageStream, {
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
    });
    ajax.parseUrlParams(sseOptions);
    await sse(sseOptions);
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

  const botBody = (
    <>
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
                <div className={style['over-tips']}>Conversation End</div>
              ))}
          </Flex>
        </Flex>
      </div>
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
              <>
                {isRecord ? (
                  <Record
                    agentId={agentId}
                    onChange={msg => {
                      setCurrentMessage(msg);
                    }}
                    onComplete={msg => {
                      setIsRecord(false);
                      if (msg) {
                        return sendMessage({ type: 'text', value: msg });
                      }
                    }}
                  />
                ) : (
                  <div className={style['message-input-border']}>
                    <Flex className={style['message-input-outer']} align="center">
                      <Input.TextArea
                        ref={inputRef}
                        onCompositionStart={() => {
                          setIsComposing(true);
                          inputTimer.current && clearTimeout(inputTimer.current);
                        }}
                        onCompositionEnd={() => {
                          inputTimer.current = setTimeout(() => {
                            setIsComposing(false);
                          }, 0);
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
                      <Button
                        size="small"
                        icon={<AudioFilled />}
                        shape="circle"
                        type="link"
                        onClick={() => {
                          setIsRecord(true);
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
              </>
            )}
            <Typography.Link className={style['term']} target="_blank" href={`${getPublicPath('leapin-ai-agent')}/terms.html`}>
              Privacy and terms
            </Typography.Link>
          </div>
        )}
      </Flex>
    </>
  );
  return (
    <Flex vertical className={classnames(className, style['chat'])}>
      {openSide ? (
        <Splitter
          onResize={sizes => {
            localStorage.setItem('LEAPIN_AI_AGENT_WINDOW_SIZES', sizes);
            setSizes(sizes);
          }}
        >
          <Splitter.Panel size={sizes[0]}>
            {list.length > 0 ? (
              <SimpleBar className={classnames(style['side-content-outer'], 'side-content-outer')}>
                <SideMessage messages={list} evening={evening} />
              </SimpleBar>
            ) : (
              <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Spin />
              </Flex>
            )}
          </Splitter.Panel>
          <Splitter.Panel size={sizes[1]}>{botBody}</Splitter.Panel>
        </Splitter>
      ) : (
        botBody
      )}
    </Flex>
  );
});

const ChartBot = createWithRemoteLoader({
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
            openSide={data.agent.is_dynamic_output && document.documentElement.clientWidth >= 600}
            lastTime={data.countdown_time}
            isEnd={data.status === 2}
            messageList={data.messages}
            agentId={data.agent.id}
            getOpenApi={getOpenApi}
            agentAvatar={get(data, 'agent_application.agent.avatar')}
          />
        );
      }}
    />
  );
});

export default ChartBot;

export { MessageList };
