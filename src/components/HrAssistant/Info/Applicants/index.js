import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import { Button, Flex, App, Pagination } from 'antd';
import { MessageList } from '@components/ChatBot';
import CandidatePreview from '@components/CandidatePreview';
import style from '../../../ChatHistory/style.module.scss';

const Applicants = createWithRemoteLoader({
  modules: [
    'components-core:InfoPage@TableView',
    'components-core:Global@usePreset',
    'components-core:Filter',
    'components-core:ButtonGroup',
    'components-core:Icon',
    'components-core:StateTag',
    'components-core:Modal@useModal',
    'components-core:Modal@ModalButton',
    'components-core:Enum',
    'components-core:FormInfo',
    'components-core:InfoPage@CentralContent',
    'components-core:File@FileLink'
  ]
})(({ remoteModules, data: agentData }) => {
  const [TableView, usePreset, Filter, ButtonGroup, Icon, StateTag, useModal, ModalButton, Enum, FormInfo, CentralContent, FileLink] = remoteModules;
  const [filter, setFilter] = useState([]);
  const { SearchInput, getFilterValue, fields: filterFields } = Filter;
  const { SuperSelectFilterItem } = filterFields;
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { apis, ajax } = usePreset();
  const modal = useModal();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const { Input, PhoneNumber } = FormInfo.fields;
  const { message } = App.useApp();
  const filterValue = getFilterValue(filter);
  return (
    <Fetch
      {...Object.assign({}, apis.agent.getApplicationList, {
        params: Object.assign({}, filterValue, { page, page_size: pageSize }),
        urlParams: {
          agent_id: agentData.id
        }
      })}
      render={({ data, reload }) => {
        return (
          <Flex vertical gap={8}>
            <Enum moduleName="atsStage">
              {list => {
                return (
                  <Filter
                    className="filter"
                    value={filter}
                    onChange={setFilter}
                    list={[
                      [
                        /*<SuperSelectFilterItem name="status" label="State" single
                                                                                   options={list.map((item) => {
                                                                                       return {
                                                                                           value: item.value,
                                                                                           label: item.description
                                                                                       };
                                                                                   })}/>*/
                        <SuperSelectFilterItem
                          name="status"
                          label="Status"
                          single
                          showSelectedTag={false}
                          options={[
                            { label: 'Not started', value: 0 },
                            { label: 'In progress', value: 1 },
                            { label: 'Completed', value: 2 }
                          ]}
                        />
                      ]
                    ]}
                    extra={<SearchInput className={style['search-input']} name="name" label="Name" />}
                  />
                );
              }}
            </Enum>
            <TableView
              columns={[
                {
                  name: 'name',
                  title: 'Name',
                  getValueOf: item => {
                    return get(item, 'application.name');
                  },
                  render: (name, { target }) => {
                    return (
                      <ModalButton
                        type="link"
                        className="btn-no-padding"
                        api={Object.assign({}, apis.agent.getApplicationDetail, {
                          urlParams: { applications_id: get(target, 'application.id') }
                        })}
                        modalProps={({ data }) => {
                          return {
                            title: 'Candidate Preview',
                            footer: null,
                            children: <CandidatePreview data={data} />
                          };
                        }}
                      >
                        {name}
                      </ModalButton>
                    );
                  }
                },
                {
                  name: 'role',
                  title: 'Role',
                  span: 6,
                  getValueOf: item => {
                    return get(item, 'application.job.jobname');
                  }
                },
                {
                  name: 'state',
                  title: 'Stage',
                  getValueOf: item => get(item, 'application.status'),
                  render: stage => {
                    return <Enum moduleName="atsStage" name={stage} />;
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
                      item.messages &&
                      item.messages.length > 0 && (
                        <Button
                          type="link"
                          className="btn-no-padding"
                          onClick={() => {
                            modal({
                              title: 'Chat History',
                              footer: null,
                              children: <MessageList list={item.messages} startTime={item.start_time} />
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
                  name: 'create_time',
                  title: 'Start Time',
                  format: 'date-DD.MM.YYYY()HH:mm'
                },
                {
                  name: 'options',
                  title: '',
                  width: '16px',
                  getValueOf: item => {
                    if (get(item, 'application.status') !== 0) {
                      return <></>;
                    }
                    return (
                      <ButtonGroup
                        showLength={0}
                        list={[
                          {
                            type: 'link',
                            children: 'Resend invitation',
                            onClick: () => {
                              formModal({
                                title: 'Resend invitation',
                                autoClose: true,
                                size: 'small',
                                okText: 'Resend',
                                formProps: {
                                  data: {
                                    name: get(item, 'application.name'),
                                    email: get(item, 'application.email'),
                                    phone: `${get(item, 'application.mobile_country_code') || ''} ${get(item, 'application.mobile')}`
                                  },
                                  onSubmit: async data => {
                                    const phoneProps = (() => {
                                      if (!data.phone) {
                                        return {};
                                      }
                                      const [mobile_country_code, mobile] = data.phone.split(' ');
                                      return { mobile, mobile_country_code };
                                    })();
                                    const { data: resData } = await ajax(
                                      Object.assign({}, apis.agent.job.resend, {
                                        urlParams: {
                                          agent_id: item.agent,
                                          application_id: get(item, 'application.id')
                                        },
                                        data: Object.assign({}, phoneProps, {
                                          name: data.name
                                        })
                                      })
                                    );

                                    if (resData.code !== 0) {
                                      return false;
                                    }
                                    message.success('Success');
                                    reload();
                                  }
                                },
                                children: (
                                  <Flex vertical gap={24}>
                                    <div>
                                      <CentralContent
                                        dataSource={item.application}
                                        col={1}
                                        columns={[
                                          {
                                            name: 'name',
                                            title: 'Name'
                                          },
                                          {
                                            name: 'jobName',
                                            title: 'Job Name',
                                            getValueOf: item => get(item, 'job.jobname')
                                          },
                                          {
                                            name: 'resume',
                                            title: 'Resume',
                                            getValueOf: item => item.cv_url,
                                            render: item => {
                                              return (
                                                <FileLink title="Resume" src={item}>
                                                  Click Checked
                                                </FileLink>
                                              );
                                            }
                                          }
                                        ]}
                                      />
                                    </div>
                                    <FormInfo
                                      title="Confirmation of key information"
                                      column={1}
                                      list={[<Input name="name" label="Name" />, <PhoneNumber name="phone" label="Phone" interceptor="phone-number-string" />, <Input name="email" label="Email" rule="EMAIL" />]}
                                    />
                                  </Flex>
                                )
                              });
                            }
                          },
                          {
                            type: 'link',
                            danger: true,
                            children: 'Rejected',
                            //message: 'Sure reject?',
                            onClick: async () => {
                              const { data: resData } = await ajax(
                                Object.assign({}, apis.agent.job.rejected, {
                                  data: [
                                    {
                                      application_id: get(item, 'application.id'),
                                      status: 5
                                    }
                                  ]
                                })
                              );
                              if (resData.code !== 0) {
                                return;
                              }
                              message.success('Success');
                              reload();
                            }
                          }
                        ]}
                        more={<Button icon={<Icon type="icon-gengduo2" />} className="btn-no-padding" type="link" />}
                      />
                    );
                  }
                }
              ]}
              dataSource={data.results}
            />
            <Flex justify="flex-end">
              <Pagination
                showSizeChanger={false}
                hideOnSinglePage
                total={data.count}
                current={page}
                pageSize={pageSize}
                onChange={page => {
                  setPage(page);
                }}
              />
            </Flex>
          </Flex>
        );
      }}
    />
  );
});

export default Applicants;
