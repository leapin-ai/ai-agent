import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Fetch from '@kne/react-fetch';
import { Flex, Pagination } from 'antd';

const Knowledge = createWithRemoteLoader({
  modules: ['components-core:FileList', 'components-core:Global@usePreset']
})(({ remoteModules, data: agentData, fileListData, reload }) => {
  const [FileList, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  return (
    <FileList
      list={(fileListData.results || []).map(({ id, url, title }) => {
        return { id, src: url, url, filename: title };
      })}
      setList={() => {
        reload();
      }}
      apis={{
        onUpload: async ({ file }) => {
          // uploadKnowledge
          const { data: resData } = await ajax.postForm(
            Object.assign(apis.agent.uploadKnowledge, {
              urlParams: { agent_id: agentData.id },
              params: {
                agent_id: agentData.id,
                title: file.name
              },
              data: {
                file: file
              }
            })
          );

          if (resData.code !== 0) {
            return { data: resData };
          }
          return {
            data: {
              code: 0,
              data: {
                id: resData.data.id,
                filename: resData.data.title,
                src: resData.data.url
              }
            }
          };
        },
        onDelete: async item => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.agent.removeKnowledge, {
              urlParams: { knowledge_id: item.id }
            })
          );
          return resData.code === 0;
        }
      }}
    />
  );
});

const KnowledgeList = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, data: agentData }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [page, setPage] = useState(1);
  const pageSize = 100;
  return (
    <Fetch
      {...Object.assign({}, apis.agent.getKnowledgeList, {
        urlParams: { agent_id: agentData.id },
        params: { page, page_size: pageSize }
      })}
      render={({ data, reload }) => {
        return (
          <Flex vertical gap={8}>
            <Knowledge reload={reload} fileListData={data} data={agentData} />
            <Flex justify="flex-end">
              <Pagination hideOnSinglePage total={data.count} current={page} pageSize={pageSize} onChange={setPage} />
            </Flex>
          </Flex>
        );
      }}
    />
  );
});

export default KnowledgeList;
