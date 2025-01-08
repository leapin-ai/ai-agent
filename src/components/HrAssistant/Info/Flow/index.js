import { useState } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import FlowChart from '@kne/react-flow-chart';
import '@kne/react-flow-chart/dist/index.css';

const Flow = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormDrawer', 'components-core:FormInfo']
})(({ remoteModules }) => {
  const [useDrawer, FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const drawer = useDrawer();
  const [flowData, setFlowData] = useState([]);

  return (
    <FlowChart
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
          title: '条件内容分支',
          content: '条件内容'
        }
      }}
      onChange={setFlowData}
    />
  );
});

export default Flow;
