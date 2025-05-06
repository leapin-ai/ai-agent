import { createWithRemoteLoader } from '@kne/remote-loader';
import { MessageOutlined } from '@ant-design/icons';
import { App, Button, Flex } from 'antd';
import get from 'lodash/get';
import * as XLSX from 'xlsx';
import merge from 'lodash/merge';
import { useNavigate } from 'react-router-dom';

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

const Recruit = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton', 'components-core:FormInfo']
})(({ remoteModules, disabled, baseUrl, id, name }) => {
  const [usePreset, LoadingButton, FormInfo] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const { SuperSelect, Upload, Input, PhoneNumber } = FormInfo.fields;
  const { TableList, useFormModal } = FormInfo;
  const formModal = useFormModal();
  const navigate = useNavigate();
  return (
    <>
      <LoadingButton
        disabled={disabled}
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
        disabled={disabled}
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
    </>
  );
});

export default Recruit;
