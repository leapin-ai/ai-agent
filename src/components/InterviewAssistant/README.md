
# InterviewAssistant


### 概述

用于实现一个面试助理


### 示例


#### 示例样式

```scss
.example-driver-preview {
  background: #f6f7f9;
}
```

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _InterviewAssistant(@components/InterviewAssistant),_mockPreset(@root/mockPreset)

```jsx
const {Report} = _InterviewAssistant;
const {interviewReport, resumeData} = _mockPreset;
const BaseExample = () => {
    return <Report data={interviewReport} extraData={{resumeData}} jd="产品经理"/>;
};

render(<BaseExample/>);

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

