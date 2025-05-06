
# InterviewAssistant


### 概述

用于实现一个面试助理


### 示例(全屏)


#### 示例样式

```scss
.example-driver-preview {
  background: #f6f7f9;
}
```

#### 示例代码

- 面试过程
- 这里填写示例说明
- _InterviewAssistant(@components/InterviewAssistant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { InterviewProgress } = _InterviewAssistant;
const { interviewStage, default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <InterviewProgress
        list={[1, 2, 3, 5]}
        stage={interviewStage}
        onStageChange={async () => {
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        }}
      />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 面试
- 这里填写示例说明
- _InterviewAssistant(@components/InterviewAssistant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Interview } = _InterviewAssistant;
const { interviewStage, default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <Interview
        stage={interviewStage}
        resume={{ src: window.PUBLIC_URL + '/test-resume.pdf' }}
        jd="前端工程师"
        recorder={callback => {
          return callback({ ready: true, text: '你好面试官' });
        }}
      />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 面试报告
- 这里填写示例说明
- _InterviewAssistant(@components/InterviewAssistant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Report } = _InterviewAssistant;
const { interviewReport, resumeData } = _mockPreset;
const BaseExample = () => {
  return <Report data={interviewReport} extraData={{ resumeData }} jd="产品经理" />;
};

render(<BaseExample />);

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

