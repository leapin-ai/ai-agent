import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App } from 'antd';
import get from 'lodash/get';
import style from './style.module.scss';

const Skill = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data: agentData, reload }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { Form, MultiField, SubmitButton } = FormInfo;
  const { TextArea } = FormInfo.fields;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <Form
      type="default"
      data={{
        skills: get(agentData, 'config.skills')
      }}
      onSubmit={async data => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.setAgentConfig, {
            urlParams: { agent_id: agentData.id },
            data: {
              agent_id: agentData.id,
              skills: data.skills
            }
          })
        );

        if (resData.code !== 0) {
          return;
        }
        message.success('Success');
        reload();
      }}
    >
      <FormInfo
        className={style['form-info']}
        column={1}
        list={[
          <MultiField
            name="skills"
            label="Agent skills"
            rule="REQ"
            ignoreLabelWidth
            labelTips="When chatting with the agent, you can use one or more of the following skills"
            field={TextArea}
            autoSize={{ minRows: 4 }}
            placeholder={`- Expertise in screening candidate
- Based on their cv, tailor different interview questions`}
          />
        ]}
      />
      <Flex justify="flex-end" gap={16}>
        <SubmitButton>Save</SubmitButton>
      </Flex>
    </Form>
  );
});

export default Skill;
