import { Flex } from 'antd';
import Fetch from '@kne/react-fetch';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams } from 'react-router-dom';
import AssistantHeader from './AssistantHeader';
import Info from './Info';
import Setting from './Setting';

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
            <AssistantHeader baseUrl={baseUrl} reload={reload} id={data.id} type={data.use_scene} status={data.status} avatar={data.avatar} name={data.name} roles={data.role} />
            <Setting type={data.use_scene} baseUrl={baseUrl} empty={<Info data={data} reload={reload} baseUrl={baseUrl} />} />
          </Flex>
        );
      }}
    />
  );
});

export default HrAssistant;
