import style from './style.module.scss';
import { Fragment } from 'react';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import classnames from 'classnames';
import defaultAvatar from '../../common/defaultAvatar.png';
import { createWithRemoteLoader } from '@kne/remote-loader';
import markdown from 'markdown-it/index.mjs';
import CheckList from './CheckList';
import last from 'lodash/last';
import get from 'lodash/get';

const md = markdown();

const MessageList = createWithRemoteLoader({
  modules: ['components-cre:Image']
})(({ remoteModules, list, startTime, currentMessage, agentAvatar, onConditionChange, children = null }) => {
  const [Image] = remoteModules;
  return (
    <Flex className={classnames(style['message-list'], 'message-list')} vertical gap={20}>
      <Flex justify="center" className={style['message-time']}>
        {dayjs(startTime).format('YYYY-MM-DD HH:mm:ss')}
      </Flex>
      {list.map((item, index) => {
        return (
          <Fragment key={item.id}>
            {!(index === 0 && (item.user_content || '').trim() === '') && (
              <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
                <Image.Avatar className={style['message-avatar']} gender="M" size={28} />
                <div
                  className={style['message-content']}
                  dangerouslySetInnerHTML={{
                    __html: item.type === 'condition' ? get(item, 'current_selection[0].label') : md.render(item.user_content || '')
                  }}
                />
                <div className={style['message-black']} />
              </Flex>
            )}
            <Flex className={style['message']} gap={12}>
              <Image.Avatar className={style['message-avatar']} src={agentAvatar || defaultAvatar} size={28} />
              {item.type === 'condition' && item === last(list) ? (
                <Flex vertical gap={8} className={style['message-content']}>
                  <div dangerouslySetInnerHTML={{ __html: md.render(item.chatbot_content || item.content || '') }} />
                  <div>
                    <CheckList loading={currentMessage} options={item.options} onChange={onConditionChange} />
                  </div>
                </Flex>
              ) : (
                <div className={style['message-content']} dangerouslySetInnerHTML={{ __html: md.render(item.chatbot_content || item.content || '') }} />
              )}
              <div className={style['message-black']} />
            </Flex>
          </Fragment>
        );
      })}
      {currentMessage && (
        <>
          <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
            <Image.Avatar className={style['message-avatar']} gender="M" size={28} />
            <div className={style['message-content']} dangerouslySetInnerHTML={{ __html: md.render(currentMessage || '') }} />
            <div className={style['message-black']} />
          </Flex>
          <Flex className={style['message']} gap={12}>
            <Image.Avatar className={style['message-avatar']} src={agentAvatar || defaultAvatar} size={28} />
            <div className={style['message-content']} dangerouslySetInnerHTML={{ __html: '...' }} />
            <div className={style['message-black']} />
          </Flex>
        </>
      )}
      {children}
    </Flex>
  );
});

export default MessageList;
