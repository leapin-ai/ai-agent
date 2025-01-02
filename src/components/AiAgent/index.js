import { Row, Col, Flex } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import customAgent from './custom_agent.png';
import marketplace from './marketplace.png';
import HeaderCard from './HeaderCard';
import AgentCard from './AgentCard';
import agentAvatar from './agentAvatar.png';
import style from './style.module.scss';

export { AgentCard };

const AiAgent = createWithRemoteLoader({
  modules: ['components-core:Common@SearchInput']
})(({ remoteModules, baseUrl }) => {
  const [SearchInput] = remoteModules;
  return (
    <Flex vertical gap={24}>
      <Row gutter={12}>
        <Col span={12}>
          <HeaderCard
            title={'Find an agent on the marketplace'}
            headerImg={marketplace}
            link={`${baseUrl}/marketplace`}
            description={
              'Dive into out diverse marketplace, featuring AI agents fine-tuned by experts. These ready-made solutions offer expertise catering to a wide range of needs ideal for those looking for quick depolyment and proven capabilities.'
            }
          />
        </Col>
        <Col span={12}>
          <HeaderCard
            title={'Create your own custom agent'}
            headerImg={customAgent}
            link={`${baseUrl}/create`}
            description={
              "Build an agent that's uniquely yours. tailor it to perform specifc tasks, designed and developedon-the-fly by our intuitive Al assistant. This option is perfect for those who seek a personalizectouch and have specifc requirments."
            }
          />
        </Col>
      </Row>
      <Flex className={style['my-agents']} vertical gap={24}>
        <Flex align="center" justify="space-between">
          <div className={style['title']}>My Agents</div>
          <SearchInput className={style['search-input']} placeholder="search" onSearch={() => {}} />
        </Flex>
        <Row gutter={[12, 12]}>
          {Array.from({ length: 20 }).map((item, index) => {
            return (
              <Col span={8} key={index}>
                <AgentCard
                  link={`${baseUrl}/hr-assistant`}
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
    </Flex>
  );
});

export default AiAgent;
