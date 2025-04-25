import { createWithRemoteLoader } from '@kne/remote-loader';
import sse from '@root/common/sse';
import { useEffect, useMemo, useRef, useState } from 'react';
import last from 'lodash/last';
import transform from 'lodash/transform';

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

const Message = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, sessionId, apis, token, children }) => {
  const [list, setList] = useState([]);
  const [usePreset] = remoteModules;
  const { ajax } = usePreset();
  const listRef = useRef(list);
  const taskSchedulerRef = useRef(new TaskScheduler());
  const send = async message => {
    const prevMessageId = last(listRef.current.filter(({ event }) => event !== 'error'))?.id;
    const sseOptions = Object.assign({}, apis.sendSessionMessageStream, {
      urlParams: { session_id: sessionId },
      params: { token },
      data: {
        user_content: message
          ? JSON.stringify(
              Object.assign({}, message, {
                time: new Date(message.time).valueOf()
              })
            )
          : '',
        chat_message_id: prevMessageId
      },
      eventEmit: data => {
        setList(list => {
          const newList = list.slice(0);
          const index = newList.findIndex(({ id }) => id === data.id);
          if (index === -1) {
            newList.push(data);
          } else {
            newList.splice(
              index,
              1,
              Object.assign({}, newList[index], data, {
                chatbot_content: (newList[index].chatbot_content || '') + (data.chatbot_content || '')
              })
            );
          }
          listRef.current = newList;
          return newList;
        });
      }
    });
    ajax.parseUrlParams(sseOptions);
    await sse(sseOptions);
  };
  useEffect(() => {
    send('').then(() => {
      return taskSchedulerRef.current.run();
    });
    return () => {
      taskSchedulerRef.current.destroy();
    };
  }, []);

  const sendMessage = message => {
    taskSchedulerRef.current.addTask(() => send(message));
  };

  const targetList = useMemo(() => {
    return transform(
      list
        .slice(0)
        .reverse()
        .filter(item => {
          return !(
            item.type === 'error' ||
            String(item.chatbot_content).trim() === '' ||
            (item => {
              try {
                const target = JSON.parse(item.chatbot_content);
                return !(target.data && target.data.length > 0);
              } catch (e) {
                return true;
              }
            })(item)
          );
        }),
      (result, item) => {
        const { data } = JSON.parse(item.chatbot_content);
        data.forEach((content, index) => {
          result.push({ id: `${item.id}-${index}`, content });
        });
      },
      []
    );
  }, [list]);

  return children({ sendMessage, list: targetList.slice(0, 4) });
});

export default Message;
