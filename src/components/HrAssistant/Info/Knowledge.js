import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Fetch from '@kne/react-fetch';
import { Flex, Pagination, Typography } from 'antd';
import dayjs from 'dayjs';
import style from './style.module.scss';

const Knowledge = createWithRemoteLoader({
  modules: ['components-core:FileList', 'components-core:Global@usePreset', 'components-core:FormInfo', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, data: agentData, fileListData, reload }) => {
  const [FileList, usePreset, FormInfo, useFormModal] = remoteModules;
  const { ajax, apis } = usePreset();
  const formModal = useFormModal();
  const { Input } = FormInfo.fields;
  return (
    <FileList
      className={style['file-list']}
      list={(fileListData.results || []).map(({ id, url, title, create_time, fix_time }) => {
        return {
          id,
          src: url,
          url,
          filename: url.match(/[^/]+$/)[0],
          title,
          date: fix_time || create_time
        };
      })}
      setList={() => {
        reload({ page: 1 });
      }}
      apis={{
        onUpload: async ({ file }) => {
          const { data: resData } = await ajax.postForm(
            Object.assign(apis.agent.uploadKnowledge, {
              urlParams: { agent_id: agentData.id },
              params: {
                agent_id: agentData.id,
                title: file.name.replace(/\.[^/.]+$/, '')
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
                filename: resData.data.url.match(/[^/]+$/)[0],
                title: resData.data.title,
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
        },
        onEditModalShow: (item, apis) => {
          const modalApi = formModal({
            title: 'Edit Knowledge Title',
            size: 'small',
            formProps: {
              data: { title: item.title },
              onSubmit: async formData => {
                const res =
                  apis?.onEdit &&
                  (await apis?.onEdit({
                    formData,
                    item
                  }));
                if (res !== false) {
                  modalApi.close();
                }
              }
            },
            children: <FormInfo column={1} list={[<Input name="title" label="title" labelHidden rule="REQ" />]} />
          });
        },
        onEdit: async ({ formData, item }) => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.agent.saveKnowledge, {
              urlParams: { knowledge_id: item.id },
              params: {
                title: formData.title
              }
            })
          );
          return resData.code === 0;
        }
      }}
      infoItemRenders={[
        item => {
          return item.title ? <Typography.Text>{item.title}</Typography.Text> : null;
        },
        item => {
          return item.date ? <Typography.Text>{dayjs(item.date).format('DD.MM.YYYY HH:mm:ss')}</Typography.Text> : null;
        }
      ]}
    />
  );
});

const KnowledgeList = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, data: agentData }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
