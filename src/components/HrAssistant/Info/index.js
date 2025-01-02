import { Tabs } from 'antd';
import Skill from './Skill';
import Prompt from './Prompt';
import Knowledge from './Knowledge';
import Basic from './Basic';
import style from './style.module.scss';

const Info = () => {
  return (
    <Tabs
      className={style['info']}
      items={[
        {
          key: 'skills',
          label: 'Skills',
          children: <Skill />
        },
        {
          key: 'prompt',
          label: 'Prompt',
          children: <Prompt />
        },
        {
          key: 'knowledge',
          label: 'Knowledge',
          children: <Knowledge />
        },
        {
          key: 'basic',
          label: 'Agent infos',
          children: <Basic />
        }
      ]}
    />
  );
};

export default Info;
