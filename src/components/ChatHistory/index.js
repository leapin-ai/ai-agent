import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';
import PageHeader from '@components/PageHeader';
import style from './style.module.scss';

const ChartHistory = createWithRemoteLoader({
  modules: ['components-core:InfoPage@TableView']
})(({ remoteModules }) => {
  const [TableView] = remoteModules;
  return (
    <Flex className={style['history']} vertical gap={24}>
      <PageHeader title="The Chat History" description="The chat history recoird the running status of the application, including user inputs and AI replies." />
      {/*<Flex className={style['filter']}>
        <Input />
      </Flex>*/}
      <TableView
        dataSource={[
          {
            id: 1,
            name: 'Alexandaer',
            phone: '+86 80992134',
            email: 'alex@leapin.io',
            role: ['HR Assistant'],
            status: 0,
            startDate: '2024-12-30 11:30:23',
            endDate: '2024-12-30 12:45:00'
          },
          {
            id: 2,
            name: 'Alexandaer',
            phone: '+86 80992134',
            email: 'alex@leapin.io',
            role: ['HR Assistant'],
            status: 0,
            startDate: '2024-12-30 11:30:23',
            endDate: '2024-12-30 12:45:00'
          }
        ]}
        columns={[
          {
            name: 'name',
            title: 'Name'
          },
          {
            name: 'phone',
            title: 'Phone'
          },
          {
            name: 'email',
            title: 'Email'
          },
          {
            name: 'role',
            title: 'Role'
          },
          {
            name: 'agentName',
            title: 'Agent Name'
          },
          {
            name: 'status',
            title: 'Status'
          },
          {
            name: 'history',
            title: 'Chat History'
          },
          {
            name: 'startDate',
            title: 'Start Date',
            format: 'date-DD.MM.YYYY()HH:mm'
          },
          {
            name: 'endDate',
            title: 'End Date',
            format: 'date-DD.MM.YYYY()HH:mm'
          }
        ]}
      />
    </Flex>
  );
});

export default ChartHistory;
