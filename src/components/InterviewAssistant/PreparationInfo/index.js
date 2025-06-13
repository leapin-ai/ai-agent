import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { Flex, Button } from 'antd';
import { useRef } from 'react';

const PreparationInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:StateTag', 'components-core:File@PrintButton']
})(({ remoteModules, data, reload }) => {
  const [InfoPage, StateTag, PrintButton] = remoteModules;
  const ref = useRef(null);
  if (!(data && data.length > 0)) {
    return (
      <Flex align="center" justify="center" className={style['no-data']} vertical gap={12}>
        <h2 className={style['no-data-title']}>Getting things ready...</h2>
        <div className={style['no-data-subtitle']}>Your interview materials will be ready in about 2 minutes.</div>
        <Button shape="round"
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
    <>
      <div ref={ref} className={style['outer-container']}>
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
      </div>
      <Flex justify="center" className={style['footer']}>
        <PrintButton contentRef={ref} shape="round">
          Print
        </PrintButton>
      </Flex>
    </>
  );
});

export default PreparationInfo;
