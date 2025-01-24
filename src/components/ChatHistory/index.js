import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Flex, Pagination, Button, Space } from 'antd';
import PageHeader from '@components/PageHeader';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageList } from '@components/ChatBot';
import style from './style.module.scss';

const ChartHistory = createWithRemoteLoader({
  modules: ['components-core:InfoPage@TableView', 'components-core:Global@usePreset', 'components-core:Common@SearchInput', 'components-core:Modal@useModal', 'components-core:StateTag']
})(({ remoteModules, baseUrl }) => {
  const [TableView, usePreset, SearchInput, useModal, StateTag] = remoteModules;
  const { apis } = usePreset();
  const [keyword, setKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = useModal();
  const page = searchParams.get('page') || 1,
    pageSize = 10;
  return (
    <Flex className={style['history']} vertical gap={24}>
      <PageHeader title="The Chat History" description="The chat history record the running status of the application, including user inputs and AI replies." />
      <Flex className={style['filter']} justify="space-between">
        <div></div>
        <div>
          <SearchInput className={style['search-input']} value={keyword} placeholder="search" onSearch={setKeyword} />
        </div>
      </Flex>
      <Fetch
        {...Object.assign({}, apis.agent.getSessionList, {
          params: { page, page_size: pageSize, keyword }
        })}
        render={({ data }) => {
          return (
            <Flex vertical gap={8}>
              <TableView
                dataSource={data.results}
                columns={[
                  {
                    name: 'name',
                    title: 'Name',
                    getValueOf: item => {
                      const info = get(item, 'agent_application.application') || get(item, 'agent_application.employee');

                      return info?.name;
                    }
                  },
                  {
                    name: 'phone',
                    title: 'Phone',
                    getValueOf: item => {
                      const info = get(item, 'agent_application.application') || get(item, 'agent_application.employee');

                      return info?.mobile;
                    }
                  },
                  {
                    name: 'email',
                    title: 'Email',
                    getValueOf: item => {
                      const info = get(item, 'agent_application.application') || get(item, 'agent_application.employee');

                      return info?.email;
                    }
                  },
                  {
                    name: 'role',
                    title: 'Role',
                    getValueOf: item => {
                      return (
                        <Space wrap>
                          {(get(item, 'agent_application.agent.role') || []).map(role => (
                            <div key={role} className={style['tag']}>
                              {role}
                            </div>
                          ))}
                        </Space>
                      );
                    }
                  },
                  {
                    name: 'agentName',
                    title: 'Agent Name',
                    getValueOf: item => {
                      return <Link to={`${baseUrl}/detail?id=${get(item, 'agent_application.agent.id')}`}>{get(item, 'agent_application.agent.name')}</Link>;
                    }
                  },
                  {
                    name: 'status',
                    title: 'Status',
                    render: status => {
                      if (status === 0) {
                        return <StateTag text="Not started" />;
                      }
                      if (status === 1) {
                        return <StateTag type="progress" text="In progress" />;
                      }

                      if (status === 2) {
                        return <StateTag type="success" text="Completed" />;
                      }

                      return <StateTag text="Unknown" />;
                    }
                  },
                  {
                    name: 'messages',
                    title: 'Chat History',
                    getValueOf: item => {
                      return (
                        <Button
                          className="btn-no-padding"
                          type="link"
                          onClick={() => {
                            modal({
                              title: 'Chat History',
                              footer: null,
                              children: <MessageList agentAvatar={get(item, 'agent_application.agent.avatar')} list={item.messages} startTime={item.start_time} />
                            });
                          }}
                        >
                          Check
                        </Button>
                      );
                    }
                  },
                  {
                    name: 'start_time',
                    title: 'Start Time',
                    format: 'date-DD.MM.YYYY()HH:mm'
                  },
                  {
                    name: 'end_time',
                    title: 'End Time',
                    format: 'date-DD.MM.YYYY()HH:mm'
                  }
                ]}
              />
              <Flex justify="flex-end">
                <Pagination
                  showSizeChanger={false}
                  hideOnSinglePage
                  total={data.count}
                  current={page}
                  pageSize={pageSize}
                  onChange={page => {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.set('page', page);
                    setSearchParams(newSearchParams);
                  }}
                />
              </Flex>
            </Flex>
          );
        }}
      />
    </Flex>
  );
});

export default ChartHistory;
