import { Flex, Space, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import style from './style.module.scss';

const AgentCard = ({ link, avatar, title, roles, description }) => {
  const navigate = useNavigate();
  return (
    <Flex
      vertical
      className={style['card']}
      gap={12}
      onClick={() => {
        link && navigate(link);
      }}
    >
      <Flex gap={8}>
        <Flex flex={0}>
          <Avatar className={style['avatar']} src={avatar} alt="avatar" />
        </Flex>
        <Flex vertical>
          <div className={style['title']}>{title}</div>
          <Flex gap={8} wrap>
            {(roles || []).map(role => (
              <div key={role} className={style['tag']}>
                {role}
              </div>
            ))}
          </Flex>
        </Flex>
      </Flex>
      <div className={style['description']}>{description}</div>
    </Flex>
  );
};

export default AgentCard;
