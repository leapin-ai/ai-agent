import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Flex, Pagination, Space } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import style from './style.module.scss';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import classnames from 'classnames';
import { MessageList } from '@components/ChatBot';
import Report from './Report';

const AIInterview = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Common@SearchInput',
    'components-core:InfoPage@TableView',
    'components-core:Modal@ModalButton',
    'components-core:Modal@useModal',
    'components-ckeditor:Editor.Content',
    'components-core:StateTag',
    'components-core:ButtonGroup',
    'components-core:Icon'
  ]
})(({ remoteModules, type, baseUrl }) => {
  const [usePreset, SearchInput, TableView, ModalButton, useModal, EditorContent, StateTag, ButtonGroup, Icon] = remoteModules;
  const { apis } = usePreset();
  const [keyword, setKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = searchParams.get('page') || 1,
    pageSize = 10;

  const modal = useModal();

  return (
    <Flex className={style['container']} vertical gap={24}>
      <Flex className={style['filter']} justify="space-between">
        <div></div>
        <div>
          <SearchInput className={style['search-input']} value={keyword} placeholder="search" onSearch={setKeyword} />
        </div>
      </Flex>
      <Fetch
        {...Object.assign({}, apis.agent.getSessionList, {
          params: { page, page_size: pageSize, keyword, use_scene: type }
        })}
        render={({ data, isComplete }) => {
          return (
            <Flex
              className={classnames('loading-container', {
                'is-loading': !isComplete
              })}
              vertical
              gap={8}>
              <TableView
                dataSource={data.results}
                columns={[
                  {
                    name: 'name',
                    title: 'Name',
                    getValueOf: item => {
                      return get(item, 'extra_info.applicant_name');
                    }
                  },
                  {
                    name: 'email',
                    title: 'Email',
                    getValueOf: item => get(item, 'extra_info.applicant_email')
                  },
                  {
                    name: 'jobTitle',
                    title: 'Job title',
                    getValueOf: item => get(item, 'extra_info.data.job_title')
                  },
                  {
                    name: 'jd',
                    title: 'JD',
                    getValueOf: item => get(item, 'extra_info.data.job_description'),
                    render: item => {
                      return (
                        <ModalButton
                          type="link"
                          className="btn-no-padding"
                          modalProps={{
                            title: 'JD',
                            children: <EditorContent>{item}</EditorContent>,
                            footer: null
                          }}>
                          Click Checked
                        </ModalButton>
                      );
                    }
                  },
                  {
                    name: 'status',
                    title: 'Status',
                    getValueOf: item => get(item, 'summary_status') === 1 && get(item, 'status') === 2,
                    render: (item, { target }) => {
                      if (item && !!get(target, 'intent_summary.summary_by_llm.report.error')) {
                        return <StateTag type="danger" text="Error" />;
                      }
                      if (item) {
                        return <StateTag type="info" text="Ended" />;
                      }
                      return <StateTag type="progress" text="Progress" />;
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
                          }}>
                          Check
                        </Button>
                      );
                    }
                  },
                  {
                    name: 'result',
                    title: 'Result',
                    getValueOf: item => get(item, 'intent_summary.summary_by_llm'),
                    render: (item, { target }) => {
                      return (
                        <ModalButton
                          type="link"
                          className="btn-no-padding"
                          modalProps={{
                            size: 'large',
                            children: (
                              <Report
                                data={item.output}
                                flowData={get(target['flow_data'], 'QA_history','').split(',')}
                                messages={target.messages}
                                agentAvatar={get(target, 'agent_application.agent.avatar')}
                                extraData={get(target, 'extra_info.data')}
                                startTime={get(target, 'start_time')}
                                endTime={get(target, 'end_time')}
                              />
                            ),
                            footer: null
                          }}>
                          Click checked
                        </ModalButton>
                      );
                    }
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

export default AIInterview;
