import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { useNavigate } from 'react-router-dom';

const InterviewAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton', 'components-core:FormInfo', 'components-ckeditor:Editor', 'components-core:Enum']
})(({ remoteModules, id, name, baseUrl }) => {
  const [usePreset, LoadingButton, FormInfo, Editor, Enum] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const { Upload, Input, CheckboxGroup } = FormInfo.fields;
  const navigate = useNavigate();
  return (
    <LoadingButton
      type="primary"
      onClick={async () => {
        const formApi = formModal({
          title: 'Upload info',
          saveText: 'Start',
          formProps: {
            type: 'inner',
            data: {
              stages: [1, 2, 3, 5]
            },
            onSubmit: async data => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.agent.chatBot.addSession, {
                  data: {
                    agent_id: id,
                    title: `Test ${name} Assistant`,
                    extra_info: { data }
                  }
                })
              );
              if (resData.code !== 0) {
                return;
              }
              navigate(`${baseUrl}/interview-assistant-test?id=${id}&sessionId=${resData.data.id}`);
              formApi.close();
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <Upload
                  name="resume"
                  label="Resume"
                  interceptor="array-single"
                  maxLength={1}
                  renderTips={() => ''}
                  onSave={async ({ data }) => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.agent.job.resumeParse, {
                        data: {
                          resume_url: data.src
                        }
                      })
                    );
                    if (resData.code !== 0) {
                      return;
                    }

                    return Object.assign({}, data, {
                      resumeData: resData.data
                    });
                  }}
                  rule="REQ"
                />,
                <Input name="jobTitle" label="Job title" rule="REQ" />,
                <Enum moduleName="interviewStage">
                  {stageList => {
                    return (
                      <CheckboxGroup
                        className={style['checkbox-group']}
                        name="stages"
                        label="Stages"
                        rule="REQ"
                        options={stageList.map(item => {
                          return {
                            value: item.value,
                            label: `${item.description} (${item.time}) ${item.info}`
                          };
                        })}
                      />
                    );
                  }}
                </Enum>,
                <Editor className={style['editor']} name="jd" label="JD" rule="REQ" />
              ]}
            />
          )
        });
      }}
    >
      Test Assistant
    </LoadingButton>
  );
});

export default InterviewAssistant;
