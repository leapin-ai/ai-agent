import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { Flex, Button } from 'antd';

const PreparationInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:StateTag']
})(({ remoteModules, data, reload }) => {
  const [InfoPage, StateTag] = remoteModules;
  if (!(data && data.length > 0)) {
    return (
      <Flex align="center" justify="center" className={style['no-data']} vertical gap={12}>
        <h2 className={style['no-data-title']}>Getting things ready...</h2>
        <div className={style['no-data-subtitle']}>Your interview materials will be ready in about 2 minutes.</div>
        <Button
          type="primary"
          onClick={() => {
            reload && reload();
          }}>
          Reload
        </Button>
      </Flex>
    );
  }
  return (
    <InfoPage>
      {(data || []).map(({ title, subtitle, advices }, index) => {
        return (
          <InfoPage.Part title={title} subtitle={subtitle} key={index}>
            <ul className={style['questions-list']}>
              {(advices || []).map(({ question, tag }, index) => {
                return (
                  <li key={index}>
                    <StateTag type="info" text={tag} />
                    {question}
                  </li>
                );
              })}
            </ul>
          </InfoPage.Part>
        );
      })}
    </InfoPage>
  );
});

export default PreparationInfo;
