import { useState } from 'react';
import { App, Flex } from 'antd';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import FlowChart, { localeLoader } from '@kne/react-flow-chart';
import en from '@kne/react-flow-chart/dist/locale/en';
import '@kne/react-flow-chart/dist/index.css';

localeLoader('en', en);

const Flow = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormDrawer', 'components-core:FormInfo', 'components-core:LoadingButton']
})(({ remoteModules, data: agentData }) => {
  const [usePreset, useDrawer, FormInfo, LoadingButton] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const drawer = useDrawer();
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const [flowData, setFlowData] = useState(get(agentData, 'config.workflow') || []);

  return (
    <Flex vertical gap={4}>
      <FlowChart
        locale="en"
        value={flowData}
        vertical
        onEditNode={({ nodeData, replaceNode }) => {
          if (nodeData.type === 'normal') {
            const api = drawer({
              title: 'Edit Normal Node',
              formProps: {
                data: {
                  title: nodeData.title,
                  question: nodeData.question,
                  answer: nodeData.answer
                },
                onSubmit: data => {
                  replaceNode(Object.assign({}, nodeData, data, { content: data.question || nodeData.content }));
                  api.close();
                }
              },
              children: <FormInfo column={1} list={[<Input name="title" label="Title" rule="REQ" />, <TextArea name="question" label="Question" rule="REQ" />, <TextArea name="answer" label="Answer" />]} />
            });
            return;
          }
          if (nodeData.type === 'condition') {
            const api = drawer({
              title: 'Edit Condition Node',
              formProps: {
                data: {
                  title: nodeData.title,
                  question: nodeData.question
                },
                onSubmit: data => {
                  replaceNode(Object.assign({}, nodeData, data, { content: data.question || nodeData.content }));
                  api.close();
                }
              },
              children: <FormInfo column={1} list={[<Input name="title" label="Title" />, <TextArea name="question" label="Question" />]} />
            });
            return;
          }
          if (nodeData.type === 'branch') {
            const api = drawer({
              title: 'Edit Branch Node',
              formProps: {
                data: {
                  title: nodeData.title,
                  label: nodeData.label,
                  value: nodeData.value
                },
                onSubmit: data => {
                  replaceNode(Object.assign({}, nodeData, data, { content: data.label || nodeData.content }));
                  api.close();
                }
              },
              children: <FormInfo column={1} list={[<Input name="title" label="Title" />, <Input name="label" label="Label" />, <Input name="value" label="Value" />]} />
            });
            return;
          }
        }}
        nodeTemplate={{
          condition: {
            title: 'Conditional Branch',
            content: 'conditional Branch Content'
          }
        }}
        onChange={setFlowData}
      />
      <Flex justify="flex-end">
        <LoadingButton
          type="primary"
          onClick={async () => {
            const { data: resData } = await ajax(
              Object.assign({}, apis.agent.setAgentConfig, {
                urlParams: { agent_id: agentData.id },
                data: {
                  agent_id: agentData.id,
                  workflow: flowData
                }
              })
            );
            if (resData.code !== 0) {
              return;
            }
            message.success('Success');
          }}
        >
          Save
        </LoadingButton>
      </Flex>
    </Flex>
  );
});

export default Flow;
