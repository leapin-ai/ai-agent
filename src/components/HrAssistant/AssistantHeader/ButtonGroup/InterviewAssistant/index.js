import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { useNavigate } from 'react-router-dom';

const InterviewAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton', 'components-core:FormInfo', 'components-ckeditor:Editor']
})(({ remoteModules, id, name, baseUrl }) => {
  const [usePreset, LoadingButton, FormInfo, Editor] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const { Upload, Input } = FormInfo.fields;
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
            <>
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
              />
              <Input name="jobTitle" label="Job title" rule="REQ" />
              <Editor className={style['editor']} name="jd" label="JD" rule="REQ" />
            </>
          )
        });
      }}
    >
      Test Assistant
    </LoadingButton>
  );
});

export default InterviewAssistant;
