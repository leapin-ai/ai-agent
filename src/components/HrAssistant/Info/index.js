import { Tabs } from 'antd';
import Skill from './Skill';
import Prompt from './Prompt';
import Flow from './Flow';
import Knowledge from './Knowledge';
import Basic from './Basic';
import style from './style.module.scss';

const Info = ({ data }) => {
  return (
    <Tabs
      className={style['info']}
      items={[
        {
          key: 'skills',
          label: 'Skills',
          children: <Skill data={data} />
        },
        {
          key: 'prompt',
          label: 'Prompt',
          children: <Prompt data={data} />
        },
        {
          key: 'flow',
          label: 'Flow',
          children: <Flow data={data} />
        },
        {
          key: 'knowledge',
          label: 'Knowledge',
          children: <Knowledge data={data} />
        },
        {
          key: 'basic',
          label: 'Agent infos',
          children: <Basic data={data} />
        }
      ]}
    />
  );
};

export default Info;
