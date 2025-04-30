import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import React, { useEffect, useState } from 'react';
import localStorage from '@kne/local-storage';
import { Splitter, Spin, Flex, Button } from 'antd';
import InterviewProgress from '../InterviewProgress';
import { ReactComponent as LogoIcon } from '../InterviewProgress/logo.svg';
import classnames from 'classnames';
import voiceData from '../voice.json';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES = 'LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES';

const Interview = createWithRemoteLoader({
  modules: ['components-core:StateBar', 'components-core:Common@SimpleBar', 'components-core:FilePreview', 'components-ckeditor:Editor.Content', 'components-core:Tooltip', 'components-core:Icon']
})(({ remoteModules, resume, jobTitle, recorder, jd, list, stage, operation, isContinue, onStart, onStageChange, onOperation, onComplete }) => {
  const [StateBar, SimpleBar, FilePreview, EditorContent, Tooltip, Icon] = remoteModules;
  const [contentTab, setContentTab] = useState('resume');
  const [sizes, setSizes] = useState(localStorage.getItem(LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES) || ['50%', '50%']);
  const [start, setStart] = useState(false);

  return (
    <Splitter
      className={style['container']}
      onResize={sizes => {
        localStorage.setItem(LEAPIN_INTERVIEW_ASSISTANT_WINDOW_SIZES, sizes);
        setSizes(sizes);
      }}
    >
      <Splitter.Panel size={sizes[0]}>
        <StateBar
          activeKey={contentTab}
          onChange={setContentTab}
          stateOption={[
            { tab: 'Resume', key: 'resume' },
            { tab: 'JD', key: 'jd' }
          ]}
        />
        <SimpleBar className={style['scroller']}>
          {contentTab === 'resume' && <FilePreview {...Object.assign({}, resume)} />}
          {contentTab === 'jd' && <EditorContent>{jd || ''}</EditorContent>}
        </SimpleBar>
      </Splitter.Panel>
      <Splitter.Panel size={sizes[1]}>
        {start ? (
          <>
            <SimpleBar className={classnames(style['result-scroller'])}>
              <InterviewProgress
                list={list}
                operation={operation}
                stage={stage}
                onStageChange={onStageChange}
                onOperation={onOperation}
                onComplete={async () => {
                  setStart(false);
                  onComplete && (await onComplete());
                }}
              />
            </SimpleBar>
            {recorder &&
              recorder(({ ready, text }) => {
                return (
                  <div className={style['voice-outer']}>
                    {ready ? (
                      <Tooltip overlayClassName={style['voice-text-outer']} content={<div className={style['voice-text']}>{text}</div>} open={!!text} placement="left">
                        <DotLottieReact className={style['voice']} data={voiceData} speed={2} loop autoplay />
                      </Tooltip>
                    ) : (
                      <Spin />
                    )}
                  </div>
                );
              })}
          </>
        ) : (
          <Flex className={style['right-content']} justify="center" align="center" vertical gap={32}>
            <Flex justify="center">
              <LogoIcon />
            </Flex>
            <Flex vertical justify="center" align="center">
              {jobTitle && <h3>{jobTitle}</h3>}
              <div className={style['start-tips']}>
                <h3>注意事项</h3>
                <ul className={style['start-tips-info']}>
                  <li>请保证处于一个安静的环境，确保面试官和候选人收音正常</li>
                  <li>请在结束面试时点击结束面试按钮</li>
                  <li>面试过程中，请按照您自己的面试规划点击切换不同的面试环节，以获得更好的面试建议及更准确的面试结果分析报告</li>
                  <li>面试过程中，可以将您认为重要的面试建议固定住，它将不会被后面的建议问题刷新掉</li>
                  <li>面试过程中，对于不需要的建议问题可以删除掉，后续就不会再出现这条建议问题</li>
                </ul>
              </div>
            </Flex>
            <Button
              type="primary"
              size="large"
              shape="round"
              icon={<Icon type="fasongduihua" />}
              onClick={() => {
                setStart(true);
                onStart && onStart();
              }}
            >
              {isContinue ? '继续面试' : '开始面试'}
            </Button>
          </Flex>
        )}
      </Splitter.Panel>
    </Splitter>
  );
});

export default Interview;
