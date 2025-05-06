import qs from 'qs';
import transform from 'lodash/transform';
import cookie from 'js-cookie';
import { message } from 'antd';

const sse = config => {
  const { url, params, urlParams, data, method, eventEmit, ...options } = config;
  const queryString = qs.stringify(
    transform(
      Object.assign({}, params, data, {
        token: params.token || cookie.get('token')
      }),
      (result, value, key) => {
        if (value !== void 0) {
          result[key] = value;
        }
      },
      {}
    )
  );

  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`${url}${queryString ? '?' + queryString : ''}`);
    const result = [];
    eventSource.onmessage = event => {
      // 处理服务器推送的消息
      const data = JSON.parse(event.data);
      result.push(data);
      eventEmit && eventEmit(data, result);
      if (['error', 'message_end'].indexOf(data.event) > -1) {
        eventSource.close();
      }
      if (data.event === 'message_end') {
        resolve(result);
      } else if (data.event === 'error') {
        reject(new Error(data.chatbot_content));
      }
    };
    eventSource.onerror = error => {
      eventSource.close();
      reject(error);
    };
  }).catch(error => {
    error.message && message.error(error.message);
    return Promise.reject(error);
  });
};

export default sse;
