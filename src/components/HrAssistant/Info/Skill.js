import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App } from 'antd';
import get from 'lodash/get';
import style from './style.module.scss';

const Skill = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data: agentData }) => {
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
      }}
    >
      <FormInfo
        className={style['form-info']}
        column={1}
        list={[
          <MultiField
            name="skills"
            label="Agent skills"
            ignoreLabelWidth
            labelTips="When chatting with the agent, you can use one or multiple of the following skills"
            field={TextArea}
            placeholder={`- Expertise in screening candidate
- based on their cv, tailor different interview questions`}
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
