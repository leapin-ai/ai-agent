import { createWithRemoteLoader } from '@kne/remote-loader';
import { CreateAgentFormInner } from '@components/CreateAgent';
import { Flex } from 'antd';

const Basic = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { SubmitButton, Form } = FormInfo;
  return (
    <Form type="default">
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
