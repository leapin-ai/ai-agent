import { Flex, Space, Button, Avatar, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../../common/defaultAvatar.png';
import style from './style.module.scss';

const AssistantHeader = ({ name, roles, baseUrl }) => {
  const navigate = useNavigate();
  return (
    <div className={style['assistant-header-outer']}>
      <Flex gap={20} className={style['assistant-header']}>
        <Avatar size={54} src={defaultAvatar} />
        <Flex flex={1} vertical gap={24}>
          <Flex gap={24} align="center">
            <Flex vertical flex={1} gap={8}>
              <div className={style['title']}>{name}</div>
              <Space>
                {roles.map(name => (
                  <div className={style['tag']}>{name}</div>
                ))}
              </Space>
            </Flex>
            <Divider className={style['divider']} type="vertical" />
            <Button type="primary">Publish</Button>
          </Flex>

          <div>
            <Button
              type="primary"
              onClick={() => {
                navigate(`${baseUrl}/chat-bot`);
              }}
            >
              Start Chat
            </Button>
          </div>
        </Flex>
      </Flex>
    </div>
  );
};

export default AssistantHeader;
