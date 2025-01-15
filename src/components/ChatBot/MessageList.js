import style from './style.module.scss';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import classnames from 'classnames';
import defaultAvatar from '../../common/defaultAvatar.png';
import { createWithRemoteLoader } from '@kne/remote-loader';
import markdown from 'markdown-it/index.mjs';

const md = markdown();

const MessageList = createWithRemoteLoader({
  modules: ['components-cre:Image']
})(({ remoteModules, list, startTime, children = null }) => {
  const [Image] = remoteModules;
  return (
    <Flex className={classnames(style['message-list'], 'message-list')} vertical gap={20}>
      <Flex justify="center" className={style['message-time']}>
        {dayjs(startTime).format('YYYY-MM-DD HH:mm:ss')}
      </Flex>
      {list.map((item, index) => {
        return (
          <>
            {!(index === 0 && (item.user_content || '').trim() === '') && (
              <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
                <Image.Avatar className={style['message-avatar']} gender="M" size={28} />
                <div
                  className={style['message-content']}
                  dangerouslySetInnerHTML={{
                    __html: md.render(item.user_content)
                  }}
                />
              </Flex>
            )}
            <Flex className={style['message']} gap={12}>
              <Image.Avatar className={style['message-avatar']} src={defaultAvatar} size={28} />
              <div className={style['message-content']} dangerouslySetInnerHTML={{ __html: md.render(item.chatbot_content) }} />
            </Flex>
          </>
        );
      })}
      {children}
    </Flex>
  );
});

export default MessageList;
