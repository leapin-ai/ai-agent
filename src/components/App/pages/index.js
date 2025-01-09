import loadable from '@loadable/component';
import { Spin } from 'antd';

const loadableWithProps = func =>
  loadable(func, {
    fallback: <Spin style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
  });

const pages = {
  Home: loadableWithProps(() => import('./Home')),
  CreateAgent: loadableWithProps(() => import('./CreateAgent')),
  Marketplace: loadableWithProps(() => import('./Marketplace')),
  HrAssistant: loadableWithProps(() => import('./HrAssistant')),
  ChatBot: loadableWithProps(() => import('./ChatBot')),
  History: loadableWithProps(() => import('./History'))
};

export default pages;
