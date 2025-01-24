import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App } from 'antd';
import style from './style.module.scss';
import get from 'lodash/get';

const Prompt = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, data: agentData, reload }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { TextArea } = FormInfo.fields;
  const { message } = App.useApp();
  const { ajax, apis } = usePreset();
  return (
    <Form
      type="default"
      data={{
        prompt: get(agentData, 'config.prompt')
      }}
      onSubmit={async data => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.agent.setAgentConfig, {
            urlParams: { agent_id: agentData.id },
            data: {
              agent_id: agentData.id,
              prompt: data.prompt
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
      <FormInfo className={style['form-info']} column={1} list={[<TextArea autoSize={{ minRows: 4 }} name="prompt" ignoreLabelWidth label="Prompt" labelTips={`This is the prompt that virtual employee will use to generate respnses.`} />]} />
      <Flex justify="flex-end" gap={16}>
        <SubmitButton>Save</SubmitButton>
      </Flex>
    </Form>
  );
});

export default Prompt;
