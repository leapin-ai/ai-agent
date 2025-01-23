import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';

export const GlobalPage = createWithRemoteLoader({
  modules: ['components-core:Global']
})(({ remoteModules, preset, ...props }) => {
  const [Global] = remoteModules;
  return <Global className="app" {...props} preset={preset} />;
});

const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Layout']
})(({ remoteModules, paths, navigateTo, ...props }) => {
  const [Layout] = remoteModules;
  return (
    <GlobalPage {...props}>
      <Layout
        navigation={{
          defaultTitle: 'leapin-saas',
          showIndex: false,
          list: paths,
          navigateTo,
          headerLogo: { src: window.PUBLIC_URL + '/logo.png' }
        }}
      >
        <Outlet />
      </Layout>
    </GlobalPage>
  );
});

export default MainLayout;
