import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App } from 'antd';
import PageHeader from '@components/PageHeader';
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
        <Avatar
          wrappedClassName="no-background"
          name="avatar"
          labelHidden
          displayAvatar={value => ({ src: value })}
          defaultAvatar={defaultAvatar}
          apis={{
            ossUpload: async ({ file }) => {
              return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => {
                  resolve({
                    data: {
                      code: 0,
                      data: e.target.result
                    }
                  });
                };
                reader.readAsDataURL(file);
              });
            }
          }}
        />,
        <Input name="name" label="Name" placeholder={'Give your app a name'} rule="REQ" />,
        <MultiField name="role" label="Role" placeholder={'Give a role of your app'} field={Input} maxLength={3} />,
        <TextArea ignoreLabelWidth name="description" label="Description" autoSize={{ minRows: 4 }} placeholder={'Enter the description of  the app'} />,
        <TextArea name="goals" ignoreLabelWidth label="Goals" autoSize={{ minRows: 4 }} placeholder={'The name of the task'} />
      ]}
    />
  );
});

const CreateAgent = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const navigate = useNavigate();
  return (
    <Form
      className={style['form']}
      type="default"
      onSubmit={async data => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.addAgent, {
            data
          })
        );

        if (resData.code !== 0) {
          return;
        }
        message.success('created success!');
        navigate(`${baseUrl}/detail?id=${resData.data.id}`);
      }}
    >
      <Flex vertical>
        <PageHeader title="Create My Agents" />
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
