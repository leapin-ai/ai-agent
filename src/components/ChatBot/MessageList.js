import style from './style.module.scss';
import { Fragment } from 'react';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { ReloadOutlined } from '@ant-design/icons';
import defaultAvatar from '../../common/defaultAvatar.png';
import { createWithRemoteLoader } from '@kne/remote-loader';
import CheckList from './CheckList';
import last from 'lodash/last';
import get from 'lodash/get';
import MarkdownRender from '@kne/markdown-components-render';
import { ReactComponent as LoadingIcon } from './loading.svg';
import getDefaultAvatar from './getDefaultAvatar';

const MarkdownView = ({ children }) => {
  return (
    <MarkdownRender
      htmlTransform={html => {
        const dom = document.createElement('div');
        dom.innerHTML = html;
        const components = dom.querySelectorAll('img,video,.yaml-components');
        [].slice.call(components, 0).forEach(component => {
          component.parentNode.removeChild(component);
        });
        return dom.innerHTML;
      }}
    >
      {children}
    </MarkdownRender>
  );
};

const MessageList = createWithRemoteLoader({
  modules: ['components-cre:Image', 'components-cre:LoadingButton']
})(({ remoteModules, list, startTime, currentMessage, agentAvatar, onConditionChange, onResend, isEnd, children = null }) => {
  const [Image, LoadingButton] = remoteModules;
  return (
    <Flex className={classnames(style['message-list'], 'message-list')} vertical gap={20}>
      <Flex justify="center" className={style['message-time']}>
        {(startTime ? dayjs(startTime) : dayjs()).format('YYYY-MM-DD HH:mm:ss')}
      </Flex>
      {list.map((item, index) => {
        return (
          <Fragment key={item.id}>
            {!(index === 0 && (item.user_content || '').trim() === '') && (
              <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
                <Image.Avatar className={style['message-avatar']} src={getDefaultAvatar()} size={28} />
                <div
                  className={style['message-content']}
                  dangerouslySetInnerHTML={{
                    __html: item.type === 'condition' ? get(item, 'current_selection[0].label') : item.user_content || ''
                  }}
                />
                <div className={style['message-black']} />
              </Flex>
            )}
            <div>
              <Flex className={style['message']} gap={12}>
                <Image.Avatar className={style['message-avatar']} src={agentAvatar || defaultAvatar} size={28} />
                {item.type === 'condition' && item === last(list) ? (
                  <Flex vertical gap={8} className={style['message-content']}>
                    <MarkdownView>{item.chatbot_content || item.content || ''}</MarkdownView>
                    {!isEnd && (
                      <div>
                        <CheckList loading={currentMessage} options={item.options} onChange={onConditionChange} />
                      </div>
                    )}
                  </Flex>
                ) : (
                  <div className={style['message-content']}>
                    <MarkdownView>{item.chatbot_content || item.content || ''}</MarkdownView>
                  </div>
                )}
                <div className={style['message-black']} />
              </Flex>
              {item === last(list) && item.event === 'error' && (
                <Flex gap={12}>
                  <div className={style['message-black']} />
                  <LoadingButton
                    size="small"
                    type="link"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      return onResend && onResend(item);
                    }}
                  >
                    Retry
                  </LoadingButton>
                </Flex>
              )}
            </div>
          </Fragment>
        );
      })}
      {currentMessage && (
        <>
          <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
            <Image.Avatar className={style['message-avatar']} src={getDefaultAvatar()} size={28} />
            <div
              className={style['message-content']}
              dangerouslySetInnerHTML={{
                __html: currentMessage
              }}
            />
            <div className={style['message-black']} />
          </Flex>
          <Flex className={style['message']} gap={12}>
            <Image.Avatar className={style['message-avatar']} src={agentAvatar || defaultAvatar} size={28} />
            <div className={style['message-content']}>
              <LoadingIcon />
            </div>
            <div className={style['message-black']} />
          </Flex>
        </>
      )}
      {children}
    </Flex>
  );
});

export default MessageList;
