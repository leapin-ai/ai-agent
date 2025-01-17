import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Space } from 'antd';
import dayjs from 'dayjs';
import { MobileOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import style from './style.module.scss';

const CandidatePreview = createWithRemoteLoader({
  modules: ['components-core:Layout@PageHeader', 'components-core:Icon', 'components-core:StateBar', 'components-core:FilePreview']
})(({ remoteModules, data }) => {
  const [PageHeader, Icon, StateBar, FilePreview] = remoteModules;
  console.log(data);
  return (
    <Flex vertical gap={8}>
      <PageHeader
        title={data.name}
        className={style['header']}
        info={data.create_time && `Invitational Time:${dayjs(data.create_time).format('DD.MM.YYYY HH:mm')}`}
        tags={[
          <Space>
            <MobileOutlined />
            <span>{data.mobile}</span>
          </Space>,
          <Space>
            <Icon type="xiaoxizhongxin" />
            <span>{data.email}</span>
          </Space>,
          <Space split=":" size={0}>
            <span>Apply</span>
            <span>{data.job_name}</span>
          </Space>,
          <Space split=":" size={0}>
            <span>Apply</span>
            <span>{get(data, 'header.name')}</span>
          </Space>
        ]}
      />
      <StateBar stateOption={[{ tab: 'Resume', key: '1' }]} />
      <FilePreview src={data.cv_url} />
    </Flex>
  );
});

export default CandidatePreview;
