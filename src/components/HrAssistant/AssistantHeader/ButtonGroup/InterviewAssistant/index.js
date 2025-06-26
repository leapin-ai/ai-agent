import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { useNavigate } from 'react-router-dom';
import range from 'lodash/range';
import get from 'lodash/get';
import dayjs from 'dayjs';
import { ConferenceInfo } from '@components/InterviewAssistant';

const InterviewAssistantFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-ckeditor:Editor', 'components-core:Enum', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [FormInfo, Editor, Enum, usePreset] = remoteModules;
  const { useFormContext } = FormInfo;
  const { Upload, Input, CheckboxGroup, RadioGroup, DatePicker, Select } = FormInfo.fields;
  const { apis, ajax } = usePreset();
  const { formData } = useFormContext();

  return (
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
        <Input name="jobTitle" label="Job title" rule="REQ LEN-0-100" />,
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
        <Editor className={style['editor']} name="jd" label="JD" rule="REQ" />,
        <RadioGroup
          name="interviewType"
          label="Type"
          options={[
            { value: 0, label: 'Online' },
            { value: 1, label: 'Onsite' }
          ]}
          defaultValue={0}
          rule="REQ"
        />,
        <DatePicker
          display={formData.interviewType === 0}
          name="startTime"
          label="Start time"
          rule="REQ"
          inputReadOnly
          showTime
          minuteStep={15}
          format="YYYY-MM-DD HH:mm"
          disabledDate={date => {
            return date && date.isBefore(dayjs().startOf('day'));
          }}
          disabledTime={current => {
            const now = dayjs();
            const output = {};
            if (current && current.isSame(now, 'day')) {
              output.disabledHours = () => range(0, now.hour());
            }
            return output;
          }}
        />,
        <Select
          display={formData.interviewType === 0}
          name="duration"
          label="Duration"
          defaultValue={60}
          rule="REQ"
          options={[
            { label: '15 minutes', value: 15 },
            { label: '30 minutes', value: 30 },
            {
              label: '45 minutes',
              value: 45
            },
            { label: '1 hour', value: 60 },
            { label: '1 hour 30 minutes', value: 90 },
            {
              label: '2 hours',
              value: 120
            },
            { label: '3 hours', value: 180 }
          ]}
        />
      ]}
    />
  );
});

const InterviewAssistant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton', 'components-core:FormInfo', 'components-core:Modal@useModal']
})(({ remoteModules, id, name, code, baseUrl, reload }) => {
  const [usePreset, LoadingButton, FormInfo, useModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const modal = useModal();
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
                    title: `${name} Assistant`,
                    countdown_seconds: data.duration * 60,
                    extra_info: {
                      data: Object.assign({}, data, data.interviewType === 0 && { online: true })
                    }
                  }
                })
              );
              if (resData.code !== 0) {
                return;
              }
              formApi.close();
              if (data.interviewType !== 0) {
                navigate(`${baseUrl}/interview-assistant-test?id=${id}&sessionId=${resData.data.id}`);
                return;
              }
              //线上面试 安排面试房间
              const { data: signatureResData } = await ajax(Object.assign({}, apis.agent.getSignature));
              if (resData.code !== 0) {
                return;
              }

              const { data: videoResData } = await ajax(
                Object.assign({}, apis.agent.videoConference.createRoom, {
                  data: {
                    name: `Interview [${get(data, 'jobTitle', 'job title')}] [${get(data, 'resume.resumeData.name', 'candidate')}]`,
                    includingMe: false,
                    isInvitationAllowed: false,
                    maxCount: 2,
                    startTime: data.startTime,
                    duration: data.duration,
                    members: [
                      {
                        nickname: '面试官',
                        isMaster: true
                      },
                      { nickname: `候选人[${get(data, 'resume.resumeData.name', 'candidate')}]` }
                    ],
                    origin: 'ai-agent',
                    options: {
                      documentVisibleAll: false,
                      documentTitle: '获取面试准备',
                      setting: {
                        layoutType: 3,
                        record: 'video',
                        speech: true
                      },
                      documentType: 'remote-module',
                      module: 'leapin-ai-agent:InterviewAssistant@Client',
                      moduleProps: {
                        code: get(resData.data, 'agent_application.code')
                      }
                    }
                  },
                  headers: {
                    'x-openapi-appid': signatureResData.data.appId,
                    'x-openapi-timestamp': signatureResData.data.timestamp,
                    'x-openapi-signature': signatureResData.data.signature,
                    'x-openapi-appsecret': signatureResData.data.appSecret,
                    appName: 'video-conference'
                  }
                })
              );

              const { data: saveSessionResData } = await ajax(
                Object.assign({}, apis.agent.chatBot.saveSession, {
                  urlParams: { session_id: resData.data.id },
                  data: {
                    conference_info: {
                      id: videoResData.data.id
                    }
                  }
                })
              );

              if (saveSessionResData.code !== 0) {
                return;
              }

              reload && reload();

              modal({
                title: 'Conference Info',
                size: 'small',
                children: <ConferenceInfo id={videoResData.data.id} />,
                footer: null
              });
            }
          },
          children: <InterviewAssistantFormInner />
        });
      }}>
      Start
    </LoadingButton>
  );
});

export default InterviewAssistant;
