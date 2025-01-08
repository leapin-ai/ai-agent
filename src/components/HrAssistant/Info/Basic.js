import { createWithRemoteLoader } from '@kne/remote-loader';
import { CreateAgentFormInner } from '@components/CreateAgent';
import { Flex, App } from 'antd';

const Basic = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data: agentData }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { SubmitButton, Form } = FormInfo;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <Form
      type="default"
      data={agentData}
      onSubmit={async data => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.saveAgent, {
            urlParams: { agent_id: agentData.id },
            data
          })
        );

        if (resData.code !== 0) {
          return;
        }

        message.success('Success');
      }}
    >
      <div>
        <div>Agent infos</div>
        <div>You can edit your agent infos</div>
      </div>
      <CreateAgentFormInner />
      <Flex justify="flex-end" gap={16}>
        <SubmitButton>Save</SubmitButton>
      </Flex>
    </Form>
  );
});

export default Basic;
