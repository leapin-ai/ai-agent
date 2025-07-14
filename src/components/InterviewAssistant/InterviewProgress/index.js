import { createWithRemoteLoader } from '@kne/remote-loader';
import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Row, Col, Flex, Spin } from 'antd';
import { Timer } from '@kne/count-down';
import commonStyle from '../style.module.scss';
import style from './style.module.scss';
import aiIconVideo from './ai-icon.webm';
import { PushpinOutlined, DeleteOutlined, PushpinTwoTone } from '@ant-design/icons';
import { ReactComponent as TipsIcon } from './tips.svg';
import { ReactComponent as Logo } from './logo.svg';
import dayjs from 'dayjs';
import useRefCallback from '@kne/use-ref-callback';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames';
import get from 'lodash/get';
import last from 'lodash/last';

const AIBox = createWithRemoteLoader({
  modules: ['components-core:Common@useResize']
})(({ remoteModules, ...props }) => {
  const [useResize] = remoteModules;
  const [width, setWidth] = useState(0);
  const ref = useResize(dom => {
    setWidth(Math.max(dom.clientWidth, dom.clientHeight) * 1.42);
  });
  return (
    <div ref={ref} style={{ '--box-width': `${width}px` }}>
      <div {...props} />
    </div>
  );
});

const FlowStage = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:StateTag', 'components-core:LoadingButton']
})(
  memo(
    ({ remoteModules, stage, stageAction, onOperation }) => {
      const [InfoPage, StateTag, LoadingButton] = remoteModules;

      const pinList = stageAction.filter(item => item.action === 'pin');

      const renderItem = item => {
        return (
          <Flex key={item.id} className={style['ai-tips-info']} justify="space-between" gap={8}>
            {item.pin && <PushpinTwoTone className={style['ai-tips-lock']} />}
            <Flex vertical gap={8}>
              <div>{item.text}</div>
              <Flex gap={8}>
                {(item.tags || []).map((tag, index) => {
                  return <StateTag className={commonStyle['tag']} type="info" size="small" text={tag} key={index} />;
                })}
              </Flex>
            </Flex>
            <Flex gap={4} className={style['ai-tips-options']}>
              {!item.pin && (
                <LoadingButton
                  size="small"
                  color="default"
                  variant="filled"
                  icon={<PushpinOutlined />}
                  onClick={async () => {
                    await onOperation({
                      action: 'pin',
                      target: item
                    });
                  }}
                />
              )}
              <LoadingButton
                size="small"
                variant="filled"
                color="danger"
                icon={<DeleteOutlined />}
                onClick={async () => {
                  await onOperation({
                    action: 'delete',
                    target: item
                  });
                }}
              />
            </Flex>
          </Flex>
        );
      };

      return (
        <InfoPage>
          {Array.isArray(stage?.description) && stage.description.length > 0 && (
            <InfoPage.Part>
              <Flex vertical className={style['process-tips']}>
                <Flex className={style['process-tips-header']} gap={8} align="center">
                  <TipsIcon className={style['process-tips-icon']} />
                  阶段指引
                </Flex>
                {stage.description.map((item, index) => {
                  return (
                    <Row className={style['process-tips-row']} key={index}>
                      <Col span={6}>{item.title}</Col>
                      <Col span={18}>
                        <Flex vertical gap={4}>
                          {(item.content || []).map(({ text, tags }, index) => {
                            return (
                              <Flex gap={4} align="flex-start" key={index}>
                                <Flex>{text}</Flex>
                                <Flex gap={4}>
                                  {(tags || []).map((tag, index) => {
                                    return <StateTag type="success" text={tag} key={index} />;
                                  })}
                                </Flex>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Col>
                    </Row>
                  );
                })}
              </Flex>
            </InfoPage.Part>
          )}
          {Array.isArray(stage.advice) && stage.advice.length > 0 && (
            <InfoPage.Part>
              <AIBox className={style['ai-header-outer']}>
                <div className={style['ai-tips']}>
                  <div className={style['ai-header']}>
                    <div className={style['ai-icon']}>
                      <video className={style['canvas']} src={aiIconVideo} loop autoPlay muted />
                    </div>
                    AI 实时建议
                  </div>
                  <div className={style['ai-tips-list']}>
                    {pinList.map(item => renderItem(Object.assign({}, item.target, { pin: true })))}
                    {stage.advice.filter(item => !stageAction.find(pin => pin.target?.text === item.text)).map(renderItem)}
                  </div>
                </div>
              </AIBox>
            </InfoPage.Part>
          )}
        </InfoPage>
      );
    },
    (a, b) => {
      return isEqual(a.stage, b.stage) && isEqual(a.stageAction, b.stageAction);
    }
  )
);

const FlowTitle = createWithRemoteLoader({
  modules: ['components-core:Tooltip']
})(({ remoteModules, children, open }) => {
  const [Tooltip] = remoteModules;
  const ref = useRef(null);
  return (
    <div ref={ref} className={style['flow-title']}>
      <Tooltip
        overlayClassName={style['flow-title-tooltip']}
        open={open}
        content={'点击进入下一环节'}
        placement="rightTop"
        getPopupContainer={() => {
          return ref.current && ref.current.parentElement.parentElement.parentElement;
        }}
      >
        <div>{children}</div>
      </Tooltip>
    </div>
  );
});

const InterViewProgressInner = createWithRemoteLoader({
  modules: ['components-core:InfoPage@Flow', 'components-core:ConfirmButton', 'components-core:LoadingButton']
})(({ remoteModules, list, operation, stage, onStageChange, onOperation, onComplete }) => {
  const [Flow, ConfirmButton, LoadingButton] = remoteModules;
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const { current, stageStartTime } = useMemo(() => {
    const currentOperation = last(get(operation, 'stageOperation') || []);
    return {
      current: Math.max(
        list.findIndex(item => item.value === get(currentOperation, 'stage')),
        0
      ),
      stageStartTime: get(currentOperation, 'time') ? new Date(currentOperation.time) : new Date()
    };
  }, [list, operation]);

  const stageAction = (get(operation, 'stageAction') || []).filter(item => item.stage === stage?.stage);

  const stageChange = async stage => {
    setLoading(true);
    onStageChange && (await onStageChange(stage));
    setLoading(false);
  };

  const init = useRefCallback(async () => {
    if (!stage) {
      await stageChange(list[current]);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  const loadingStage = loading || !stage;

  return (
    <Flex className={style['process']} ref={ref} vertical>
      <Flex justify="center">
        <Logo />
      </Flex>
      <Flex vertical flex={1}>
        <Flow
          className={classnames(style['flow'], {
            [style['loading']]: loadingStage
          })}
          current={current}
          onChange={current => {
            if (loadingStage) {
              return;
            }
            stageChange(Object.assign({}, list[current]));
          }}
          dataSource={list}
          columns={[
            {
              name: 'description',
              type: 'title',
              render: (title, { index, target }) => {
                return (
                  <Flex key={index} justify="space-between" align="middle" className={style['step-title']}>
                    <FlowTitle open={!loadingStage && index === current + 1}>
                      {title}({target.time})
                    </FlowTitle>
                    {current === index && (
                      <div className={style['step-timer']}>
                        {dayjs(stageStartTime).format('HH:mm:ss')}开始，已进行
                        {
                          <div className={style['timer']}>
                            <Timer />
                          </div>
                        }
                      </div>
                    )}
                  </Flex>
                );
              }
            },
            {
              name: 'info',
              type: 'description'
            },
            {
              name: 'content',
              valueIsEmpty: (item, { index }) => {
                return current !== index;
              },
              render: () => {
                if (loading || !stage) {
                  return (
                    <Flex justify="center">
                      <Spin />
                    </Flex>
                  );
                }
                if (!stage.success) {
                  return (
                    <Flex justify="center">
                      <LoadingButton
                        size="small"
                        shape="round"
                        color="default"
                        variant="filled"
                        onClick={() => {
                          return stageChange(list[current]);
                        }}
                      >
                        重新获取
                      </LoadingButton>
                    </Flex>
                  );
                }
                return <FlowStage stage={stage} stageAction={stageAction} onOperation={onOperation} />;
              }
            }
          ]}
        />
      </Flex>
      <Flex justify="center">
        <ConfirmButton type="primary" size="large" shape="round" message="确定要结束面试吗？" isDelete={false} okText="结束" className={style['end-btn']} onClick={onComplete}>
          结束面试
        </ConfirmButton>
      </Flex>
    </Flex>
  );
});

const InterViewProgress = createWithRemoteLoader({
  modules: ['components-core:Enum']
})(({ remoteModules, list, ...props }) => {
  const [Enum] = remoteModules;
  return (
    <Enum moduleName="interviewStage">
      {enumList => {
        const enumMap = new Map(enumList.map(item => [item.value, item]));
        const flowList =
          list && list.length > 0
            ? list.map(value => {
                return enumMap.get(value);
              })
            : enumList;
        return <InterViewProgressInner {...props} list={flowList} />;
      }}
    </Enum>
  );
});

export default InterViewProgress;
