import { Flex, Divider, Tabs, Row, Col } from 'antd';
import { AgentCard } from '@components/AiAgent';
import style from './style.module.scss';
import agentAvatar from '../AiAgent/agentAvatar.png';

const Marketplace = ({ baseUrl }) => {
  return (
    <Flex className={style['market']} vertical>
      <Flex vertical gap={4}>
        <div className={style['title']}>Welcome To Marketplace!</div>
        <div>Use these template apps instantly or customize your own apps based on the templates.</div>
      </Flex>
      <Divider />
      <Tabs
        items={[
          {
            key: 'recommended',
            label: 'Recommended'
          },
          {
            key: 'agent',
            label: 'Agent'
          },
          {
            key: 'assistant',
            label: 'Assistant'
          },
          {
            key: 'hr',
            label: 'HR'
          },
          {
            key: 'programming',
            label: 'Programming'
          },
          {
            key: 'workflow',
            label: 'WorkFlow'
          },
          {
            key: 'writing',
            label: 'Writing'
          }
        ]}
      />
      <Row gutter={[12, 12]}>
        {Array.from({ length: 20 }).map((item, index) => {
          return (
            <Col span={8} key={index}>
              <AgentCard
                title="GPT-Researcher EN"
                type="WORKFLOW"
                avatar={agentAvatar}
                description="GPT-Reasearcher is an expert in internet topic research. ltcan efficiently decompose a topic into sub-questions andprovide a professional research report from acomprehensive perspective."
              />
            </Col>
          );
        })}
      </Row>
    </Flex>
  );
};

export default Marketplace;
