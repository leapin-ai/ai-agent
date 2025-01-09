import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';

const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Global', 'components-core:Layout']
})(({ remoteModules, paths, preset, navigateTo, ...props }) => {
  const [Global, Layout] = remoteModules;
  return (
    <Global className="app" {...props} preset={preset}>
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
    </Global>
  );
});

export default MainLayout;
