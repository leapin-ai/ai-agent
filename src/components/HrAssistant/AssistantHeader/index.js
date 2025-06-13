import { Flex, Space, Button, Avatar, Divider, Dropdown, App } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import ButtonGroup from './ButtonGroup';
import defaultAvatar from '../../../common/defaultAvatar.png';
import style from './style.module.scss';

const AssistantHeader = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Icon',
    'components-core:LoadingButton',
    'components-core:Modal@useConfirmModal',
    'components-core:StateTag'
  ]
})(({ remoteModules, id, avatar, name, roles, status, reload, baseUrl, type, code }) => {
  const [usePreset, Icon, LoadingButton, useConfirmModal, StateTag] = remoteModules;
  const { ajax, apis } = usePreset();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const confirmModal = useConfirmModal();
  return (
    <div className={style['assistant-header-outer']}>
      <Flex gap={20} className={style['assistant-header']}>
        <Avatar size={54} src={avatar || defaultAvatar} />
        <Flex flex={1} vertical gap={24}>
          <Flex gap={24} align="center">
            <Flex vertical flex={1} gap={8}>
              <div className={style['title']}>
                {name}
                <Dropdown
                  trigger="click"
                  menu={{
                    items: [
                      {
                        key: 'duplicate',
                        label: 'Duplicate',
                        onClick: async () => {
                          const { data: resData } = await ajax(
                            Object.assign({}, apis.agent.duplicateAgent, {
                              urlParams: { agent_id: id },
                              data: { agent_id: id }
                            })
                          );
                          if (resData.code !== 0) {
                            return;
                          }
                          message.success('Duplicate success');
                          navigate(`${baseUrl}/detail?id=${resData.data.id}`);
                        }
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        danger: true,
                        onClick: () => {
                          confirmModal({
                            danger: true,
                            type: 'confirm',
                            title: 'Determine to delete?',
                            onOk: async () => {
                              const { data: resData } = await ajax(
                                Object.assign({}, apis.agent.removeAgent, {
                                  urlParams: { agent_id: id }
                                })
                              );
                              if (resData.code !== 0) {
                                return;
                              }
                              message.success('Delete successful');
                              navigate(`${baseUrl}/`);
                            }
                          });
                        }
                      }
                    ]
                  }}>
                  <Button className={style['options']} type="small" shape="round" icon={<Icon type="gengduo2" />} />
                </Dropdown>
              </div>
              <Space>
                {(roles || []).map(name => (
                  <div key={name} className={style['tag']}>
                    {name}
                  </div>
                ))}
              </Space>
            </Flex>
            <Divider className={style['divider']} type="vertical" />
            {[0, 4].indexOf(status) > -1 && (
              <LoadingButton
                type="primary"
                icon={<Icon type="fasongduihua" />}
                onClick={async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.agent.saveAgent, {
                      urlParams: { agent_id: id },
                      data: {
                        status: 1
                      }
                    })
                  );
                  if (resData.code !== 0) {
                    return;
                  }
                  message.success('Success');
                  reload();
                }}>
                Publish
              </LoadingButton>
            )}
            {status === 3 && <StateTag type="danger" text="Refusal" />}
            {status === 2 && <StateTag type="success" text="Online" />}
            {status === 1 && <StateTag type="progress" text="Auditing" />}
          </Flex>
          <Flex gap={8}>
            <ButtonGroup disabled={status !== 2} id={id} type={type} name={name} baseUrl={baseUrl} code={code} reload={reload}/>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
});

export default AssistantHeader;
