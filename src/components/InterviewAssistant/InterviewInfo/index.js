import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import PreparationInfo from '../PreparationInfo';
import React, { useState } from 'react';

const InterviewInfo = createWithRemoteLoader({
  modules: ['components-core:StateBar', 'components-core:Common@SimpleBar', 'components-core:FilePreview', 'components-ckeditor:Editor.Content', 'components-core:Tooltip', 'components-core:Icon']
})(({ remoteModules, active, resume, jd, preparationInfo, reload }) => {
  const [StateBar, SimpleBar, FilePreview, EditorContent] = remoteModules;
  const [contentTab, setContentTab] = useState(active || 'resume');
  return (
    <>
      <StateBar
        activeKey={contentTab}
        onChange={setContentTab}
        stateOption={[
          { tab: 'Resume', key: 'resume' },
          { tab: 'JD', key: 'jd' },
          {
            tab: 'Preparation',
            key: 'preparation'
          }
        ]}
      />
      <SimpleBar className={style['scroller']}>
        {contentTab === 'resume' && <FilePreview {...Object.assign({}, resume)} />}
        {contentTab === 'jd' && <EditorContent>{jd || ''}</EditorContent>}
        {contentTab === 'preparation' && <PreparationInfo data={preparationInfo} reload={reload}/>}
      </SimpleBar>
    </>
  );
});

export default InterviewInfo;
