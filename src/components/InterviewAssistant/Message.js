import { createWithRemoteLoader } from '@kne/remote-loader';
import sse from '@root/common/sse';
import { useEffect, useRef, useState } from 'react';
import last from 'lodash/last';
import merge from 'lodash/merge';

class TaskScheduler {
  constructor() {
    this.taskList = []; // 任务队列
    this.isRunning = false; // 是否正在执行任务
    this.pollingTimer = null; // 轮询定时器（用于队列空时的检查）
  }

  // 添加任务到队列
  addTask(task) {
    this.taskList.push(task);
    if (!this.isRunning) {
      this.run(); // 如果当前没有任务在执行，启动事件循环
    }
  }

  // 执行任务（事件循环）
  async run() {
    if (this.taskList.length === 0) {
      this.isRunning = false;
      // 如果队列为空，1秒后再次检查（保存定时器以便销毁）
      this.pollingTimer = setTimeout(() => {
        if (this.taskList.length > 0) {
          this.run();
        }
      }, 1000);
      return;
    }

    this.isRunning = true;
    const task = this.taskList.shift(); // 取出第一个任务

    try {
      await task(); // 执行任务（等待 Promise 完成）
    } catch (error) {
      console.error('Task failed:', error);
    }

    // 当前任务完成后，继续执行下一个任务
    await this.run();
  }

  // 销毁调度器（停止轮询并清空队列）
  destroy() {
    // 1. 清除轮询定时器
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
    // 2. 清空任务队列
    this.taskList = [];
    // 3. 标记为未运行状态
    this.isRunning = false;
    console.log('Scheduler destroyed.');
  }
}

const formatOutput = input => {
  if (input && typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch (e) {}
  }
  return input;
};

const Message = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, sessionId, apis, token, list: messageList, onMessage, children }) => {
  const formatMessage = message => {
    const newMessage = Object.assign({}, message);
    newMessage.chatbot_content = formatOutput(message.chatbot_content);
    newMessage.user_content = formatOutput(message.user_content);
    return newMessage;
  };
  const [list, setList] = useState((messageList || []).map(formatMessage));
  const [error, setError] = useState(null);
  const [usePreset] = remoteModules;
  const { ajax, appName, env } = usePreset();
  const listRef = useRef(list);
  const taskSchedulerRef = useRef(new TaskScheduler());
  const [conversationId,setConversationId] = useState(null);

  const send = async message => {
    const prevMessageId = last(listRef.current.filter(({ event }) => event !== 'error'))?.id;
    const sseOptions = Object.assign({}, apis.sendSessionMessageStream, {
      urlParams: { session_id: sessionId },
      params: { token },
      data: {
        user_content: message
          ? JSON.stringify(
              Object.assign({}, message, {
                time: (message.time ? new Date(message.time) : new Date()).valueOf()
              })
            )
          : '',
        chat_message_id: prevMessageId
      },
      eventEmit: data => {
        if(!conversationId){
          setConversationId(data.conversation_id);
        }
        /*setList(list => {
          const newList = list.slice(0);
          const index = newList.findIndex(({ id }) => id === data.id);
          if (index === -1) {
            newList.push(data);
          } else {
            newList.splice(
              index,
              1,
              Object.assign({}, newList[index], data, {
                chatbot_content: merge({}, newList[index].chatbot_content, formatOutput(data.chatbot_content || ''))
              })
            );
          }

          listRef.current = newList.map(formatMessage);
          onMessage && onMessage(last(listRef.current));
          return listRef.current;
        });*/
      }
    });
    ajax.parseUrlParams(sseOptions);
    try {
      await sse(sseOptions);
    } catch (err) {
      console.log(err);
      setError(err);
    }
  };
  useEffect(() => {
    const task = taskSchedulerRef.current;
    return () => {
      task.destroy();
    };
  }, []);

  const sendMessage = message => {
    taskSchedulerRef.current.addTask(() => send(message));
  };

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    const task = async () => {
      const { data: resData } = await ajax(
        Object.assign({}, apis.getMessageResult, {
          urlParams: { session_id: conversationId }
        })
      );
      if (resData.code !== 0) {
        return;
      }
      if (!(resData.data && resData.data.advice?.length > 0)) {
        return;
      }

      setList(list => {
        const newList = list.slice(0);
        newList.push({
          user_content: { action: 'stage' },
          chatbot_content: {
            data: resData.data
          }
        });
        return newList;
      });

      onMessage &&
        onMessage({
          user_content: resData.data.stage ? { action: 'stage' } : {},
          chatbot_content: {
            data: resData.data
          }
        });
    };
    task().then(() => {});
    const timer = setInterval(async () => {
      await task();
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [conversationId]);

  return children({
    start: async () => {
      list.length === 0 && taskSchedulerRef.current.addTask(() => send(''));
    },
    sendMessage,
    error,
    list
  });
});

export default Message;
