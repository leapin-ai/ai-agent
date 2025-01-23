import { useState } from 'react';
import { Row, Col, Flex, Pagination, Empty } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import customAgent from './custom_agent.png';
import marketplace from './marketplace.png';
import HeaderCard from './HeaderCard';
import AgentCard from './AgentCard';
import agentAvatar from './agentAvatar.png';
import style from './style.module.scss';

export { AgentCard };

const AiAgent = createWithRemoteLoader({
  modules: ['components-core:Common@SearchInput', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl }) => {
  const [SearchInput, usePreset] = remoteModules;
  const { apis } = usePreset();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page'),
    pageSize = 12;
  const [keyword, setKeyword] = useState('');
  return (
    <Flex vertical gap={24}>
      <Row gutter={12}>
        <Col span={12}>
          <HeaderCard
            title={'Find an agent on the marketplace'}
            headerImg={marketplace}
            link={`${baseUrl}/marketplace`}
            disabled
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
          <SearchInput className={style['search-input']} value={keyword} placeholder="search" onSearch={setKeyword} />
        </Flex>
        <Fetch
          {...Object.assign({}, apis.agent.getAgentList, {
            params: {
              keyword,
              page_size: pageSize,
              page
            }
          })}
          render={({ data }) => {
            return (
              <>
                <Row gutter={[12, 12]}>
                  {data.results && data.results.length > 0 ? (
                    data.results.map((item, index) => {
                      return (
                        <Col span={8} key={item.id}>
                          <AgentCard link={`${baseUrl}/detail?id=${item.id}`} title={item.name} roles={item.role} avatar={item.avatar || agentAvatar} description={item.description} />
                        </Col>
                      );
                    })
                  ) : (
                    <Col span={24}>
                      <Empty />
                    </Col>
                  )}
                </Row>
                <Flex justify="flex-end">
                  <Pagination
                    showSizeChanger={false}
                    hideOnSinglePage
                    total={data.count}
                    current={page}
                    pageSize={pageSize}
                    onChange={page => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('page', page);
                      setSearchParams(newSearchParams);
                    }}
                  />
                </Flex>
              </>
            );
          }}
        />
      </Flex>
    </Flex>
  );
});

export default AiAgent;
