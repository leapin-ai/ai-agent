import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import style from './style.module.scss';

const AgentCard = ({ link, avatar, title, type, description }) => {
  const navigate = useNavigate();
  return (
    <Flex
      vertical
      className={style['card']}
      gap={12}
      onClick={() => {
        navigate(link);
      }}
    >
      <Flex gap={8}>
        <img className={style['avatar']} src={avatar} alt="avatar" />
        <Flex vertical>
          <div className={style['title']}>{title}</div>
          <div>
            <div className={style['tag']}>{type}</div>
          </div>
        </Flex>
      </Flex>
      <div className={style['description']}>{description}</div>
    </Flex>
  );
};

export default AgentCard;
