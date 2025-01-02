import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from './defaultAvatar.png';
import style from './style.module.scss';

export const CreateAgentFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { MultiField } = FormInfo;
  const { Avatar, Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      className={style['form-inner']}
      column={1}
      list={[
        <Avatar wrappedClassName="no-background" name="avatar" labelHidden defaultAvatar={defaultAvatar} />,
        <Input name="name" label="Name" placeholder={'Give your app a name'} />,
        <MultiField name="role" label="Role" placeholder={'Give a role of your app'} field={Input} maxLength={3} />,
        <TextArea ignoreLabelWidth name="description" label="Description" placeholder={'Enter the description of  the app'} />,
        <TextArea name="goals" ignoreLabelWidth label="Goals" placeholder={'The name of the task'} />
      ]}
    />
  );
});

const CreateAgent = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const navigate = useNavigate();
  return (
    <Form className={style['form']} type="default">
      <Flex vertical>
        <div className={style['title']}>Create My Agents</div>
        <div className={style['description']}>App icon & name</div>
        <CreateAgentFormInner />
      </Flex>
      <Flex justify="flex-end" gap={16}>
        <CancelButton
          color="default"
          variant="filled"
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancel
        </CancelButton>
        <SubmitButton>Create</SubmitButton>
      </Flex>
    </Form>
  );
});

export default CreateAgent;
