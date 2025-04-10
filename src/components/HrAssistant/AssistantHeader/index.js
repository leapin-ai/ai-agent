import { Flex, Space, Button, Avatar, Divider, Dropdown, App } from 'antd';
import { createWithRemoteLoader, getPublicPath } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import get from 'lodash/get';
import { MessageOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import merge from 'lodash/merge';
import defaultAvatar from '../../../common/defaultAvatar.png';
import style from './style.module.scss';

const UploadCandidateExcel = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:File@Download']
})(({ remoteModules }) => {
  const [FormInfo, Download] = remoteModules;
  const { Upload } = FormInfo.fields;
  const { useFormContext } = FormInfo;
  const { formData, openApi } = useFormContext();
  return (
    <Flex vertical>
      <Upload.Field
        onUpload={async ({ file }) => {
          const data = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = function (e) {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(firstSheet);
              resolve(jsonData);
            };
            reader.readAsArrayBuffer(file);
          });
          openApi.setFormData(
            merge({}, formData, {
              cv_data_list: data.map(item => {
                return {
                  name: item['Candidate Name'],
                  email: item['Email'],
                  phone: '+66 ' + item['Tel']
                };
              })
            })
          );
          return {
            data: { code: 0, data: [] }
          };
        }}
        maxLength={1}
      >
        Upload Excel
      </Upload.Field>
      <div>
        Download template:
        <Download type="link" filename="CandidateTemplate.xlsx" src={window.PUBLIC_URL + '/CandidateTemplate.xlsx'}>
          Candidate template
        </Download>
      </div>
    </Flex>
  );
});

const AssistantHeader = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Icon',
    'components-core:LoadingButton',
    'components-core:Modal@useConfirmModal',
    'components-core:StateTag',
    'components-core:FormInfo@useFormModal',
    'components-core:FormInfo',
    'components-core:File@Download'
  ]
})(({ remoteModules, id, avatar, name, roles, status, reload, baseUrl }) => {
  const [usePreset, Icon, LoadingButton, useConfirmModal, StateTag, useFormModal, FormInfo, Download] = remoteModules;
  const { ajax, apis } = usePreset();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const confirmModal = useConfirmModal();
  const formModal = useFormModal();
  const { SuperSelect, Upload, Input, PhoneNumber } = FormInfo.fields;
  const { List, TableList } = FormInfo;
  return (
    <div className={style['assistant-header-outer']}>
      <Flex gap={20} className={style['assistant-header']}>
        <Avatar size={54} src={avatar || defaultAvatar} />
        <Flex flex={1} vertical gap={24}>
          <Flex gap={24} align="center">
            <Flex vertical flex={1} gap={8}>
              <div className={style['title']}>
                {name}
                <Dropdown
                  trigger="click"
                  menu={{
                    items: [
                      {
                        key: 'duplicate',
                        label: 'Duplicate',
                        onClick: async () => {
                          const { data: resData } = await ajax(
                            Object.assign({}, apis.agent.duplicateAgent, {
                              urlParams: { agent_id: id },
                              data: { agent_id: id }
                            })
                          );
                          if (resData.code !== 0) {
                            return;
                          }
                          message.success('Duplicate success');
                          navigate(`${baseUrl}/detail?id=${resData.data.id}`);
                        }
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        danger: true,
                        onClick: () => {
                          confirmModal({
                            danger: true,
                            type: 'confirm',
                            title: 'Determine to delete?',
                            onOk: async () => {
                              const { data: resData } = await ajax(
                                Object.assign({}, apis.agent.removeAgent, {
                                  urlParams: { agent_id: id }
                                })
                              );
                              if (resData.code !== 0) {
                                return;
                              }
                              message.success('Delete successful');
                              navigate(`${baseUrl}/`);
                            }
                          });
                        }
                      }
                    ]
                  }}
                >
                  <Button className={style['options']} type="small" shape="round" icon={<Icon type="gengduo2" />} />
                </Dropdown>
              </div>
              <Space>
                {(roles || []).map(name => (
                  <div key={name} className={style['tag']}>
                    {name}
                  </div>
                ))}
              </Space>
            </Flex>
            <Divider className={style['divider']} type="vertical" />
            {[0, 4].indexOf(status) > -1 && (
              <LoadingButton
                type="primary"
                icon={<Icon type="fasongduihua" />}
                onClick={async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.agent.saveAgent, {
                      urlParams: { agent_id: id },
                      data: {
                        status: 1
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
                Publish
              </LoadingButton>
            )}
            {status === 3 && <StateTag type="danger" text="Refusal" />}
            {status === 2 && <StateTag type="success" text="Online" />}
            {status === 1 && <StateTag type="progress" text="Auditing" />}
          </Flex>
          <Flex gap={8}>
            <LoadingButton
              disabled={status !== 2}
              type="primary"
              onClick={async () => {
                const { data: resData } = await ajax(
                  Object.assign({}, apis.agent.chatBot.addSession, {
                    data: {
                      agent_id: id,
                      title: `Test ${name} ChatBot`
                    }
                  })
                );
                if (resData.code !== 0) {
                  return;
                }
                navigate(`${baseUrl}/chat-bot-test?id=${id}&sessionId=${resData.data.id}`);
              }}
              icon={<MessageOutlined />}
            >
              Test Chat
            </LoadingButton>
            <Button
              disabled={status !== 2}
              onClick={() => {
                formModal({
                  title: 'Invite',
                  size: 'large',
                  autoClose: true,
                  saveText: 'Invite',
                  formProps: {
                    onSubmit: async data => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.agent.job.deliverJob, {
                          data: {
                            agent_id: id,
                            job_id: data.jobId.value,
                            cv_data_list: data.cv_data_list.map(({ name, email, phone, resume }) => {
                              const phoneProps = (() => {
                                if (!phone) {
                                  return {};
                                }
                                const [mobile_country_code, mobile] = phone.split(' ');
                                return { mobile, mobile_country_code };
                              })();
                              return Object.assign({}, phoneProps, {
                                name,
                                email,
                                cv_url: get(resume, '[0].src')
                              });
                            })
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return false;
                      }
                      message.success('Send invitation successfully');
                    }
                  },
                  children: (
                    <FormInfo
                      column={1}
                      list={[
                        <SuperSelect
                          name="jobId"
                          label="Job"
                          rule="REQ"
                          single
                          showSelectedTag={false}
                          pagination={{
                            paramsType: 'params',
                            current: 'page',
                            pageSizeName: 'page_size'
                          }}
                          searchPlaceholder="Search by job name"
                          getSearchProps={({ searchText }) => {
                            return { job_name: searchText };
                          }}
                          api={Object.assign({}, apis.agent.job.getJobList, {
                            params: {
                              status: 0,
                              page_size: 20,
                              job_leader: 'all'
                            },
                            transformData: data => {
                              return {
                                totalCount: data.count,
                                pageData: data.results.map(item => {
                                  return { label: item.jobname, value: item.id };
                                })
                              };
                            }
                          })}
                        />,
                        <UploadCandidateExcel />,
                        <TableList
                          title="Candidates"
                          name="cv_data_list"
                          column={1}
                          minLength={1}
                          list={[
                            <Input wrappedClassName="no-background" name="name" label="Name" rule="REQ" />,
                            <Upload wrappedClassName="no-background" name="resume" label="Resume" maxLength={1} renderTips={() => ''} onSave={({ data }) => data} />,
                            <PhoneNumber wrappedClassName="no-background" name="phone" label="Phone" format="string" />,
                            <Input wrappedClassName="no-background" name="email" label="Email" rule="EMAIL" />
                          ]}
                        />
                      ]}
                    />
                  )
                });
              }}
            >
              Invite
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
});

export default AssistantHeader;
