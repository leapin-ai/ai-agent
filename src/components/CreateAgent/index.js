import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App } from 'antd';
import PageHeader from '@components/PageHeader';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from './defaultAvatar.png';
import style from './style.module.scss';

export const CreateAgentFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { MultiField, useFormContext } = FormInfo;
  const { apis } = usePreset();
  const { Avatar, Input, TextArea, Select, Switch, SuperSelect } = FormInfo.fields;
  const { formData } = useFormContext();
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
            upload: async ({ file }) => {
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
        <Select
          name="use_scene"
          label="Scene"
          options={[
            { label: 'Recruit', value: 0 },
            { label: 'Interview assistant', value: 2 },
            { label: 'AI interview', value: 3 },
            {
              label: 'Other',
              value: 1
            }
          ]}
          rule="REQ"
        />,
        <SuperSelect
          display={formData.use_scene === 0}
          name="job_id"
          label="Job"
          rule="REQ"
          interceptor="object-output-value"
          single
          showSelectedTag={false}
          pagination={{
            paramsType: 'params',
            current: 'page',
            pageSizeName: 'page_size'
          }}
          searchPlaceholder="Search by job name"
          getSearchProps={({ searchText }) => {
            return { job_name: searchText };
          }}
          api={Object.assign({}, apis.agent.job.getJobList, {
            params: {
              status: 0,
              page_size: 20,
              job_leader: 'all'
            },
            transformData: data => {
              return {
                totalCount: data.count,
                pageData: data.results.map(item => {
                  return { label: item.jobname, value: item.id };
                })
              };
            }
          })}
        />,
        <Switch name="is_dynamic_output" label="Side info" />,
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
