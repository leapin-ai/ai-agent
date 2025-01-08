import React from 'react';
import { preset as fetchPreset } from '@kne/react-fetch';
import { Spin, Empty, message } from 'antd';
import axios from 'axios';
import { preset as remoteLoaderPreset, loadModule } from '@kne/remote-loader';
import omit from 'lodash/omit';
import cookie from 'js-cookie';
import { getApis as getAgentApis } from '@components/Apis';

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
        if (response.status !== 200 || (response.data.hasOwnProperty('code') && response.data.code !== 0 && response.config.showError !== false)) {
          message.error(response?.data?.msg || response?.data?.error_msg?.detail || '请求发生错误');
        }
        return response;
      },
      error => {
        message.error(error.message || '请求发生错误');
        return Promise.reject(error);
      }
    );

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

      if (typeof params.urlParams === 'object' && Object.keys(params.urlParams).length > 0 && typeof params.url === 'string') {
        params.url = params.url.replace(/{([\s\S]+?)}/g, (match, name) => {
          return params.urlParams.hasOwnProperty(name) ? params.urlParams[name] : match;
        });
      }

      return instance(params);
    };
    ajax.postForm = instance.postForm;
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
    url: 'https://cdn.jsdelivr.net',
    tpl: '{{url}}/npm/@kne-components/{{remote}}@{{version}}/build'
  };

  const componentsCoreRemote = {
    ...registry,
    url: 'http://localhost:3001',
    tpl: '{{url}}',
    remote: 'components-core',
    defaultVersion: '0.2.85'
  };
  remoteLoaderPreset({
    remotes: {
      default: componentsCoreRemote,
      'components-core': componentsCoreRemote,
      'components-iconfont': {
        ...registry,
        remote: 'components-iconfont',
        defaultVersion: '0.1.8'
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
              ...registry,
              remote: 'leapin-ai-agent',
              defaultVersion: process.env.DEFAULT_VERSION
            }
    }
  });

  return {
    ajax,
    apis: Object.assign(
      {},
      {
        agent: getAgentApis()
      }
    ),
    locale: 'en-US',
    themeToken: {
      colorPrimary: '#2257bf'
    }
  };
};
