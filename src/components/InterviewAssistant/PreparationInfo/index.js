import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { Flex } from 'antd';

const PreparationInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage']
})(({ remoteModules, data }) => {
  const [InfoPage] = remoteModules;
  if (!(data && data.length > 0)) {
    return <Flex align="center" justify="center" className={style['no-data']}>Preparing for interview...</Flex>;
  }
  return (
    <InfoPage>
      {(data || []).map(({ title, subtitle, questions }, index) => {
        return (
          <InfoPage.Part title={title} subtitle={subtitle} key={index}>
            <ul className={style['questions-list']}>
              {questions.map((question, index) => {
                return <li key={index}>{question}</li>;
              })}
            </ul>
          </InfoPage.Part>
        );
      })}
    </InfoPage>
  );
});

export default PreparationInfo;
