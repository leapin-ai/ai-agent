import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';

const Skill = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, MultiField, SubmitButton } = FormInfo;
  const { TextArea } = FormInfo.fields;
  return (
    <Form type="default">
      <FormInfo
        column={1}
        list={[<MultiField name="skills" label="Agent skills" ignoreLabelWidth labelTips="When chatting with the agent, you can use one or multiple of the following skills" field={TextArea} />]}
        placeholder={`- Expertise in screening candidate
- based on their cv, tailor different interview questions`}
      />
      <Flex justify="flex-end" gap={16}>
        <SubmitButton>Save</SubmitButton>
      </Flex>
    </Form>
  );
});

export default Skill;
