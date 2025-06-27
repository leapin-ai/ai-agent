import React from 'react';
import { preset as fetchPreset } from '@kne/react-fetch';
import { Spin, Empty, message } from 'antd';
import { preset as remoteLoaderPreset } from '@kne/remote-loader';
import cookie from 'js-cookie';
import ensureSlash from '@kne/ensure-slash';
import md5 from 'md5';
import createAjax from '@kne/axios-fetch';
import { getApis as getAgentApis } from '@components/Apis';
import { enums as interviewAssistantEnums } from '@components/InterviewAssistant';

window.PUBLIC_URL = window.runtimePublicUrl || process.env.PUBLIC_URL;

const baseApiUrl = window.runtimeApiUrl || 'https://api.gw.leapin-ai.com';
window.runtimeGatewayUrl = window.runtimeGatewayUrl || baseApiUrl || 'https://api.gw.leapin-ai.com';
const appName = 'ai-agent';
const env = window.runtimeEnv?.['env'] || 'local';
const conferenceHost = window.runtimeEnv?.['conferenceHost'] || (env === 'prod' ? 'https://video-conf.leapin-ai.com' :'https://staging.video-conf.leapin-ai.com');
const cdnHost = window.runtimeEnv?.['cdnHost'] || 'https://cdn.leapin-ai.com';
export const globalInit = async () => {
  const ajax = createAjax({
    baseURL: baseApiUrl,
    errorHandler: error => message.error(error),
    getDefaultHeaders: () => {
      return {
        env,
        appName,
        Authorization: `Bearer ${cookie.get('token')}`
      };
    },
    registerInterceptors: interceptors => {
      interceptors.request.use(config => {
        //if (config.headers['env'] !== 'local') {
          config.baseURL = `${config.baseURL}/${config.headers['appName']}/${config.headers['env']}`;
        //}
        if (config.headers['appName'] !== 'ai-agent') {
          config.baseURL = `${window.runtimeGatewayUrl}/${config.headers['appName']}/${config.headers['env']}`;
        }
        delete config.headers['appName'];
        delete config.headers['env'];
        return config;
      });

      interceptors.response.use(response => {
        if (response.status === 200 && response.data.code === 401) {
          window.location.href = '/login';
          return response;
        }

        if (response.status === 200 && response.data.code === 404) {
          window.location.href = '/ai-agent/404';
          return response;
        }

        return response;
      });
    }
  });
  fetchPreset({
    ajax,
    loading: (
      <Spin
        delay={500}
        style={{
          position: 'absolute',
          left: '50%',
          padding: '10px',
          transform: 'translateX(-50%)'
        }}
      />
    ),
    error: null,
    empty: <Empty />,
    transformResponse: response => {
      const { data } = response;
      response.data = {
        code: data.code === 0 ? 200 : data.code,
        msg: data.msg,
        results: data.data
      };
      return response;
    }
  });

  const registry = {
    url: cdnHost,
    tpl: '{{url}}/components/@kne-components/{{remote}}/{{version}}/build'
  };

  const componentsCoreRemote = {
    ...registry, //url: 'http://localhost:3001',
    //tpl: '{{url}}',
    remote: 'components-core',
    defaultVersion: '0.3.24'
  };
  remoteLoaderPreset({
    remotes: {
      default: componentsCoreRemote,
      'components-core': componentsCoreRemote,
      'components-iconfont': {
        ...registry,
        remote: 'components-iconfont',
        defaultVersion: '0.2.1'
      },
      'components-ckeditor': {
        ...registry, //url: 'http://localhost:3002',
        //tpl: '{{url}}',
        remote: 'components-ckeditor',
        defaultVersion: '0.2.5'
      },
      'leapin-ai-agent':
        process.env.NODE_ENV === 'development'
          ? {
              remote: 'leapin-ai-agent',
              url: '/',
              tpl: '{{url}}',
              defaultVersion: process.env.DEFAULT_VERSION
            }
          : {
              remote: 'leapin-ai-agent',
              url: 'https://app.ap.leapin-ai.com',
              tpl: '{{url}}/ai-agent'
            }
    }
  });

  return {
    ajax,
    appName,
    env,
    conferenceHost,
    enums: Object.assign(
      {},
      {
        atsStage: [
          { description: 'Primary screening', value: 0 },
          {
            description: 'AI interview',
            value: 1
          },
          { description: 'Retest', value: 3 },
          {
            description: 'Awaiting entry',
            value: 4
          },
          { description: 'Inappropriate', value: 5 },
          { description: 'Offer', value: 8 },
          {
            description: 'Inducted',
            value: 9
          }
        ]
      },
      interviewAssistantEnums
    ),
    apis: Object.assign(
      {},
      {
        agent: getAgentApis(),
        file: {
          speechTextUrl: window.PUBLIC_URL + '/xfyun-dist', //speechTextUrl: 'https://cdn.leapin-ai.com/components/@kne/speech-text/0.2.3/xfyun-dist', //window.PUBLIC_URL + '/xfyun-dist'
          contentWindowUrl: `${cdnHost}/components/@kne/iframe-resizer/0.1.3/dist/contentWindow.js`, //pdfjsUrl: 'https://cdn.leapin-ai.com/components/pdfjs-dist/4.4.168',
          upload: async ({ file }) => {
            /*return {
                                                                                                                          data: {
                                                                                                                            code: 0,
                                                                                                                            data: {
                                                                                                                              src: 'https://user-video-staging.oss-cn-hangzhou.aliyuncs.com/tenant-89/candidate/cv/17700713ccc28c0ce29d6b87237bb8b5.pdf',
                                                                                                                              filename: file.name
                                                                                                                            }
                                                                                                                          }
                                                                                                                        };*/
            const { data: resData } = await ajax(
              Object.assign(
                {},
                {
                  url: '/api/common/upload/token',
                  params: { media_params: 'candidate-cv' },
                  method: 'GET'
                }
              )
            );
            if (resData.code !== 0) {
              return { code: resData.code, msg: resData.error_msg };
            }
            const ossConfig = resData.data;

            const md5Hash = await new Promise((resolve, reject) => {
              const fileReader = new FileReader();
              fileReader.readAsBinaryString(file);
              fileReader.onload = e => {
                const md5Hash = md5(e.target.result);
                resolve(md5Hash);
              };
              fileReader.onerror = () => {
                reject();
              };
            });

            const targetFileName = `${md5Hash}.${file.name.split('.').pop()}`;

            const { data: uploadRes } = await ajax.postForm(
              Object.assign(
                {},
                {
                  url: ossConfig.host,
                  showError: false,
                  data: {
                    key: `${ensureSlash(ossConfig.dir, true)}${targetFileName}`,
                    'x-oss-object-acl': 'public-read',
                    policy: ossConfig.policy,
                    OSSAccessKeyId: ossConfig.OSSAccessKeyId,
                    signature: ossConfig.Signature,
                    success_action_status: 201,
                    file
                  }
                }
              )
            );
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(uploadRes, 'text/xml');
            xmlDoc.getElementsByTagName('Location');
            return {
              data: {
                code: 0,
                data: { src: xmlDoc.getElementsByTagName('Location')[0].textContent, filename: file.name }
              }
            };
          }
        }
      }
    ),
    locale: 'en-US',
    themeToken: {
      colorPrimary: '#2257bf'
    },
    formInfo: {
      type: 'default'
    }
  };
};
