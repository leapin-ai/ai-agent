import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';

const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Global', 'components-core:Layout']
})(({ remoteModules, paths, preset, ...props }) => {
  const [Global, Layout] = remoteModules;
  return (
    <Global {...props} preset={preset}>
      <Layout
        navigation={{
          defaultTitle: 'AI Agent',
          showIndex: false,
          list: paths,
          headerLogo: { src: window.PUBLIC_URL + '/logo.png' }
        }}
      >
        <Outlet />
      </Layout>
    </Global>
  );
});

export default MainLayout;
