import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Input, Space, App } from 'antd';
import { useState, useEffect, useRef } from 'react';
import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import markdown from 'markdown-it';
import last from 'lodash/last';
import MessageList from './MessageList';
import useRefCallback from '@kne/use-ref-callback';
import defaultAvatar from '../../common/defaultAvatar.png';
import enter from './enter.png';
import style from './style.module.scss';

const md = markdown();

const ChartBotMessage = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset', 'components-core:Common@SimpleBar', 'components-core:Image']
})(({ remoteModules, messageList, agentId, sessionId, sessionName, startTime, apis, onComplete, className, isEnd }) => {
  const [LoadingButton, usePreset, SimpleBar, Image] = remoteModules;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(messageList || []);
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const [currentMessage, setCurrentMessage] = useState('');
  const messageListRef = useRef(null);
  useEffect(() => {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [list, loading]);
  const sendMessage = useRefCallback(async content => {
    setLoading(true);
    const { data: resData } = await ajax(
      Object.assign({}, apis.sendSessionMessage, {
        urlParams: { session_id: sessionId },
        data: {
          user_content: content,
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
      sendMessage('');
    } else {
      setLoading(false);
    }
  }, [list, sendMessage]);

  return (
    <Flex vertical className={classnames(className, style['chat'])} gap={8}>
      <div className={style['title']}>
        <Flex className={style['title-inner']} justify="space-between" align="center">
          <Space>
            <Image.Avatar src={defaultAvatar} size={54} />
            <div>{sessionName || 'Conversations'}</div>
          </Space>
          {!isEnd && (
            <LoadingButton
              type="primary"
              shape="round"
              onClick={async () => {
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
              }}
            >
              End
            </LoadingButton>
          )}
        </Flex>
      </div>
      <SimpleBar
        className={classnames(style['message-list-outer'], 'message-list-scroller', {
          [style['is-end']]: isEnd
        })}
        scrollableNodeProps={{ ref: messageListRef }}
      >
        <MessageList list={list} startTime={startTime} currentMessage={loading && currentMessage} />
      </SimpleBar>
      {!isEnd && (
        <div className={style['footer']}>
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
                    return sendMessage(msg);
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
                  return sendMessage(msg.trim());
                }}
              />
            </Flex>
          </div>
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
            isEnd={data.status === 2}
            messageList={data.messages}
            agentId={data.agent_application.id}
          />
        );
      }}
    />
  );
});

export default ChartBot;

export { MessageList };
