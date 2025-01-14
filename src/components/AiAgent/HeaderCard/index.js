import style from './style.module.scss';
import { Button, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

const HeaderCard = ({ headerImg, title, link, description, disabled }) => {
  const navigate = useNavigate();
  return (
    <div className={style['card']}>
      <div className={style['header']}>
        <img src={headerImg} alt="header" />
      </div>
      <div className={style['title']}>{title}</div>
      <div className={style['description']}>{description}</div>
      <Flex justify="flex-end">
        <Button
          type="primary"
          ghost
          disabled={disabled}
          onClick={() => {
            navigate(link);
          }}
        >
          Start <ArrowRightOutlined />
        </Button>
      </Flex>
    </div>
  );
};

export default HeaderCard;
