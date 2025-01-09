import { Flex, Space, Button, Avatar, Divider } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { MessageOutlined } from '@ant-design/icons';
import defaultAvatar from '../../../common/defaultAvatar.png';
import style from './style.module.scss';

const AssistantHeader = createWithRemoteLoader({
  modules: ['components-core:Icon']
})(({ remoteModules, id, avatar, name, roles, baseUrl }) => {
  const [Icon] = remoteModules;
  const navigate = useNavigate();
  return (
    <div className={style['assistant-header-outer']}>
      <Flex gap={20} className={style['assistant-header']}>
        <Avatar size={54} src={avatar || defaultAvatar} />
        <Flex flex={1} vertical gap={24}>
          <Flex gap={24} align="center">
            <Flex vertical flex={1} gap={8}>
              <div className={style['title']}>{name}</div>
              <Space>
                {(roles || []).map(name => (
                  <div className={style['tag']}>{name}</div>
                ))}
              </Space>
            </Flex>
            <Divider className={style['divider']} type="vertical" />
            <Button type="primary" icon={<Icon type="fasongduihua" />}>
              Publish
            </Button>
          </Flex>

          <div>
            <Button
              type="primary"
              onClick={() => {
                navigate(`${baseUrl}/chat-bot?id=${id}`);
              }}
              icon={<MessageOutlined />}
            >
              Start Chat
            </Button>
          </div>
        </Flex>
      </Flex>
    </div>
  );
});

export default AssistantHeader;
