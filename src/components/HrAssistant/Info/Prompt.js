import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';

const Prompt = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { TextArea } = FormInfo.fields;
  return (
    <Form type="default">
      <FormInfo column={1} list={[<TextArea name="prompt" ignoreLabelWidth label="Prompt" labelTips={`This is the prompt that virtual employee will use to generate respnses.`} />]} />
      <Flex justify="flex-end" gap={16}>
        <SubmitButton>Save</SubmitButton>
      </Flex>
    </Form>
  );
});

export default Prompt;
