import React from 'react';
import { preset as fetchPreset } from '@kne/react-fetch';
import { Spin, Empty, message } from 'antd';
import axios from 'axios';
import { preset as remoteLoaderPreset } from '@kne/remote-loader';
import omit from 'lodash/omit';
import cookie from 'js-cookie';
import ensureSlash from '@kne/ensure-slash';
import md5 from 'md5';
import { getApis as getAgentApis } from '@components/Apis';
import { enums as interviewAssistantEnums } from '@components/InterviewAssistant';

window.PUBLIC_URL = window.runtimePublicUrl || process.env.PUBLIC_URL;

export const defaultHeaders = headers => {
  return Object.assign({}, headers, {
    Authorization: `Bearer ${cookie.get('token')}`
  });
};

export const globalInit = async () => {
  const ajax = (() => {
    const instance = axios.create({
      validateStatus: function () {
        return true;
      }
    });

    instance.interceptors.request.use(config => {
      config.headers = Object.assign({}, defaultHeaders());
      if (config.method.toUpperCase() !== 'GET' && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    });

    instance.interceptors.response.use(
      response => {
        if (response.status === 200 && response.data.code === 401) {
          window.location.href = '/login';
          return response;
        }

        if (response.status === 200 && response.data.code === 404) {
          window.location.href = '/ai-agent/404';
          return response;
        }
        if (response.status !== 200 || (response.data.hasOwnProperty('code') && response.data.code !== 0 && response.config.showError !== false)) {
          message.error(response?.data?.msg || response?.data?.error_msg?.detail || response?.data?.error_msg || '请求发生错误');
        }
        return response;
      },
      error => {
        message.error(error.message || '请求发生错误');
        return Promise.reject(error);
      }
    );

    const parseUrlParams = params => {
      if (typeof params.urlParams === 'object' && Object.keys(params.urlParams).length > 0 && typeof params.url === 'string') {
        params.url = params.url.replace(/{([\s\S]+?)}/g, (match, name) => {
          return params.urlParams.hasOwnProperty(name) ? params.urlParams[name] : match;
        });
      }
    };

    const ajax = params => {
      if (params.hasOwnProperty('loader') && typeof params.loader === 'function') {
        return Promise.resolve(params.loader(omit(params, ['loader'])))
          .then(data => ({
            data: {
              code: 0,
              data
            }
          }))
          .catch(err => {
            message.error(err.message || '请求发生错误');
            return { data: { code: 500, msg: err.message } };
          });
      }
      parseUrlParams(params);
      return instance(params);
    };

    ajax.postForm = config => {
      parseUrlParams(config);
      const { url, params, urlParams, data, method, ...options } = config;
      const searchParams = new URLSearchParams(params);

      const queryString = searchParams.toString();

      return axios.postForm(`${url}${queryString ? '?' + queryString : ''}`, data, Object.assign({}, { headers: defaultHeaders() }, options));
    };

    ajax.parseUrlParams = parseUrlParams;

    return ajax;
  })();
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
    url: 'https://cdn.leapin-ai.com',
    tpl: '{{url}}/components/@kne-components/{{remote}}/{{version}}/build'
  };

  const componentsCoreRemote = {
    ...registry, //url: 'http://localhost:3001',
    //tpl: '{{url}}',
    remote: 'components-core',
    defaultVersion: '0.3.17'
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
          contentWindowUrl: 'https://cdn.leapin-ai.com/components/@kne/iframe-resizer/0.1.3/dist/contentWindow.js', //pdfjsUrl: 'https://cdn.leapin-ai.com/components/pdfjs-dist/4.4.168',
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
