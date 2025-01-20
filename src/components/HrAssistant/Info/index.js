import { Tabs } from 'antd';
import Skill from './Skill';
import Prompt from './Prompt';
import Flow from './Flow';
import Knowledge from './Knowledge';
import Basic from './Basic';
import Applicants from './Applicants';
import style from './style.module.scss';

const Info = props => {
  return (
    <Tabs
      className={style['info']}
      items={[
        {
          key: 'skills',
          label: 'Skills',
          children: <Skill {...props} />
        },
        {
          key: 'prompt',
          label: 'Prompt',
          children: <Prompt {...props} />
        },
        {
          key: 'flow',
          label: 'Flow',
          children: <Flow {...props} />
        },
        {
          key: 'knowledge',
          label: 'Knowledge',
          children: <Knowledge {...props} />
        },
        {
          key: 'basic',
          label: 'Agent infos',
          children: <Basic {...props} />
        },
        {
          key: 'applicants',
          label: 'Applicants',
          children: <Applicants {...props} />
        }
      ]}
    />
  );
};

export default Info;
