
# CandidatePreview


### 概述

候选人预览


### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _CandidatePreview(@components/CandidatePreview),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const {default: CandidatePreview} = _CandidatePreview;
const {createWithRemoteLoader} = remoteLoader;
const {default: mockPreset, applicationDetail} = _mockPreset;
const BaseExample = createWithRemoteLoader({
    modules: ['components-core:Global@PureGlobal']
})(({remoteModules}) => {
    const [PureGlobal] = remoteModules;
    return <PureGlobal preset={mockPreset}>
        <CandidatePreview data={applicationDetail.data}/>
    </PureGlobal>;
});

render(<BaseExample/>);

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

