import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Flex, Pagination, Space } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import style from './style.module.scss';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import classnames from 'classnames';
import { Report, ConferenceInfo } from '@components/InterviewAssistant';

const InterviewAssistant = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Common@SearchInput',
    'components-core:InfoPage@TableView',
    'components-core:File@FileLink',
    'components-core:Modal@ModalButton',
    'components-core:Modal@useModal',
    'components-ckeditor:Editor.Content',
    'components-core:StateTag',
    'components-core:ButtonGroup',
    'components-core:Icon'
  ]
})(({ remoteModules, type, baseUrl }) => {
  const [usePreset, SearchInput, TableView, FileLink, ModalButton, useModal, EditorContent, StateTag, ButtonGroup, Icon] = remoteModules;
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
          params: { page, page_size: pageSize, keyword, agent_id: searchParams.get('id'), use_scene: type }
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
                      return get(item, 'extra_info.data.resume.resumeData.name');
                    }
                  },
                  {
                    name: 'resume',
                    title: 'Resume',
                    getValueOf: item => get(item, 'extra_info.data.resume.src'),
                    render: item => {
                      return (
                        <FileLink title="Resume" src={item}>
                          Click Checked
                        </FileLink>
                      );
                    }
                  },
                  {
                    name: 'jobTitle',
                    title: 'Job title',
                    getValueOf: item => get(item, 'extra_info.data.jobTitle')
                  },
                  {
                    name: 'jd',
                    title: 'JD',
                    getValueOf: item => get(item, 'extra_info.data.jd'),
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
                            children: <Report data={item} extraData={get(target, 'extra_info.data')} startTime={get(target, 'start_time')} endTime={get(target, 'end_time')} />,
                            footer: null
                          }}>
                          Click checked
                        </ModalButton>
                      );
                    }
                  },
                  {
                    name: 'options',
                    title: 'Options',
                    getValueOf: item => {
                      if (get(item, 'status') === 2) {
                        return null;
                      }
                      if (get(item, 'extra_info.data.online') === true) {
                        return (
                          <ButtonGroup
                            showLength={0}
                            list={[
                              {
                                type: 'link',
                                children: 'Conference details',
                                onClick: () => {
                                  modal({
                                    title: 'Conference info',
                                    size: 'small',
                                    footer: null,
                                    children: <ConferenceInfo id={get(item, 'conference_info.id')} />
                                  });
                                }
                              }
                            ]}
                            more={<Button icon={<Icon type="icon-gengduo2" />} className="btn-no-padding" type="link" />}
                          />
                        );
                      }
                      return (
                        <ButtonGroup
                          showLength={0}
                          list={[
                            {
                              type: 'link',
                              children: 'Enter session',
                              onClick: () => {
                                navigate(`${baseUrl}/interview-assistant-test?id=${item.agent.id}&sessionId=${item.id}`);
                              }
                            }
                          ]}
                          more={<Button icon={<Icon type="icon-gengduo2" />} className="btn-no-padding" type="link" />}
                        />
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
          /*return (
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
                                                          name: 'result',
                                                          title: 'Chat Result',
                                                          getValueOf: item => {
                                                              return (
                                                                  item.status === 2 && (
                                                                      <Button
                                                                          type="link"
                                                                          className="btn-no-padding"
                                                                          onClick={() => {
                                                                              modal({
                                                                                  title: 'Chat History',
                                                                                  size: 'small',
                                                                                  footer: null,
                                                                                  children: (
                                                                                      <CentralContent
                                                                                          col={1}
                                                                                          columns={[
                                                                                              {
                                                                                                  name: 'result',
                                                                                                  title: 'Result'
                                                                                              },
                                                                                              {
                                                                                                  name: 'description',
                                                                                                  title: 'Description'
                                                                                              }
                                                                                          ]}
                                                                                          dataSource={{
                                                                                              result: get(item, 'intent_summary.user_intent_by_llm'),
                                                                                              description: get(item, 'intent_summary.summary_by_llm')
                                                                                          }}
                                                                                      />
                                                                                  )
                                                                              });
                                                                          }}
                                                                      >
                                                                          Check
                                                                      </Button>
                                                                  )
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
                                      );*/
        }}
      />
    </Flex>
  );
});

export default InterviewAssistant;
