import { Flex } from 'antd';
import Fetch from '@kne/react-fetch';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams } from 'react-router-dom';
import style from './style.module.scss';
import AssistantHeader from './AssistantHeader';
import Info from './Info';

const HrAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [searchParams] = useSearchParams();
  return (
    <Fetch
      {...Object.assign({}, apis.agent.getAgentDetail, {
        urlParams: { agent_id: searchParams.get('id') }
      })}
      render={({ data, reload }) => {
        return (
          <Flex vertical gap={16}>
            <AssistantHeader baseUrl={baseUrl} reload={reload} id={data.id} status={data.status} avatar={data.avatar} name={data.name} roles={data.role} />
            <Info data={data} />
          </Flex>
        );
      }}
    />
  );
});

export default HrAssistant;
