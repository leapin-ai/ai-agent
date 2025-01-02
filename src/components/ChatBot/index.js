import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Input, Button, Avatar, Space } from 'antd';
import classnames from 'classnames';
import defaultAvatar from '../../common/defaultAvatar.png';
import enter from './enter.png';
import style from './style.module.scss';

const ChartBot = createWithRemoteLoader({
  modules: ['components-core:Icon']
})(({ remoteModules, className, user, chatList }) => {
  const [Icon] = remoteModules;
  return (
    <Flex vertical className={classnames(className, style['chat'])} gap={8}>
      <Flex className={style['title']} justify="center" align="center">
        <Space>
          <Avatar src={defaultAvatar} size={54} />
          <div>与Test的对话</div>
        </Space>
      </Flex>
      <Flex className={style['message-list']} flex={1} vertical gap={20}>
        <Flex justify="center" className={style['message-time']}>
          2024-12-21 15:22
        </Flex>
        <Flex className={classnames(style['message'], style['is-user'])} gap={12}>
          <Avatar className={style['message-avatar']} src={defaultAvatar} size={28} />
          <div className={style['message-content']}>请解释一下什么叫克莱因蓝</div>
        </Flex>
        <Flex className={style['message']} gap={12}>
          <Avatar className={style['message-avatar']} src={defaultAvatar} size={28} />
          <div className={style['message-content']}>
            "克莱因蓝" 这个词组似乎不是我之前的知识库中所包含的术语。根据我的信息截止日期，即2021年9月，我并没有关于 "克莱因蓝"
            的信息。可能这是一个在我之后的时间里出现的新名词、流行词汇或者特定领域的术语。如果你能够提供更多的背景信息或上下文，我会尽力帮助你理解这个词组的含义。
          </div>
        </Flex>
      </Flex>
      <div className={style['footer']}>
        <div className={style['message-input-border']}>
          <Flex className={style['message-input-outer']}>
            <Input.TextArea className={style['message-input']} autoSize={{ minRows: 1, maxRows: 6 }} placeholder="与机器人聊天" />
            <Button className={style['message-sender']} type="primary" icon={<img src={enter} alt="enter" />} />
          </Flex>
        </div>
      </div>
    </Flex>
  );
});

export default ChartBot;
