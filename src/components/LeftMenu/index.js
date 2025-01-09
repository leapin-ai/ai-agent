import { Menu, Avatar } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import ai from './ai.png';
import aiActive from './aiActive.png';
import chat from './chat.png';
import chatActive from './chatActive.png';
import style from './style.module.scss';

const LeftMenu = ({ open, baseUrl }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeKey = pathname.indexOf(`${baseUrl}/history`) === 0 ? 'history' : 'agent';
  return (
    <Menu
      className={classnames(style['menu'], {
        [style['is-close']]: !open
      })}
      items={[
        {
          icon: <Avatar src={activeKey === 'history' ? chatActive : chat} />,
          label: 'Chat History',
          key: 'history'
        },
        {
          icon: <Avatar src={activeKey === 'agent' ? aiActive : ai} />,
          label: 'AI Agent',
          key: 'agent'
        }
      ]}
      onSelect={({ key }) => {
        const map = {
          history: `${baseUrl}/history`,
          agent: `${baseUrl}`
        };
        navigate(map[key]);
      }}
    />
  );
};

export default LeftMenu;
