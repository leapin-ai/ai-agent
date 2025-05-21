import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Alert, Row, Col, Typography, Button } from 'antd';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import dayjs from 'dayjs';
import style from './style.module.scss';
import classnames from 'classnames';
import { useState } from 'react';

const Score = ({ score, staticScore }) => {
  score = Number.isNaN(score) ? 0 : Number(score);
  return (
    <div
      className={classnames('score', style['score-item'], {
        [style['is-grey']]: staticScore > score,
        [style['low-score']]: score < 3,
        [style['middle-score']]: score === 3,
        [style['high-score']]: score > 3
      })}
    />
  );
};

const ChatMessage = createWithRemoteLoader({
  modules: ['leapin-ai-agent:ChatBot@MessageList', 'components-core:Global@usePreset']
})(({ remoteModules, agentAvatar, list }) => {
  const [MessageList, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const [open, setOpen] = useState(false);
  return (
    <div className={style['report-message']}>
      {open ? (
        <Flex vertical>
          <Button
            type="text"
            onClick={() => {
              setOpen(false);
            }}>
            Collapsible
          </Button>
          <MessageList list={list} />
        </Flex>
      ) : (
        <Button
          block
          type="text"
          onClick={() => {
            setOpen(true);
          }}>
          Chat message
        </Button>
      )}
    </div>
  );
});

const Report = createWithRemoteLoader({
  modules: ['components-core:InfoPage@Content', 'components-core:InfoPage@Report', 'components-core:Enum', 'components-core:StateTag', 'components-core:LoadingButton']
})(({ remoteModules, startTime, endTime, data, extraData }) => {
  const [Content, ReportView, Enum, StateTag] = remoteModules;
  const formattedTime = dayjs(startTime).isSame(endTime, 'day') ? `${dayjs(startTime).format('YYYY-MM-DD HH:mm')}~${dayjs(endTime).format('HH:mm')}` : `${dayjs(startTime).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(endTime).format('HH:mm')}`;
  return (
    <Flex vertical gap={24}>
      {get(data, 'details.length') > 0 ? (
        <>
          <ReportView title="Report Summary" extra={formattedTime}>
            <ReportView.List
              report={{
                list: [
                  /*{
                    label: 'Basic',
                    content: (
                      <Content
                        col={2}
                        list={[
                          {
                            label: 'Candidate',
                            content: get(data, 'deliveryRecord.candidateSnapshot.name')
                          },
                          {
                            label: 'Job name',
                            content: get(data, 'agent.job.title')
                          },
                          {
                            label: 'Step',
                            content: <Enum moduleName="deliveryStep" name={get(data, 'results.step')} />
                          },
                          {
                            label: 'Agent',
                            content: get(data, 'agent.name')
                          }
                        ]}
                      />
                    )
                  },*/
                  {
                    label: 'Conclusion',
                    content: get(data, 'pass') ? <span className={style['pass-value']}>PASS</span> : <span className={style['fail-value']}>FAIL</span>
                  },
                  {
                    label: 'Summary',
                    content: (
                      <ul>
                        {(get(data, 'summary') || []).map((str, index) => {
                          return <li key={index}>{str}</li>;
                        })}
                      </ul>
                    )
                  }
                ]
              }}
            />
          </ReportView>
          <ReportView title="Report Details">
            <ReportView.Table
              report={{
                list: get(data, 'details') || [],
                group: uniq(
                  (get(data, 'details') || []).map(({ question_type }) => {
                    return question_type;
                  })
                ).map(str => {
                  return {
                    label: str,
                    name: str
                  };
                }),
                groupName: 'question_type',
                columns: [
                  {
                    title: 'Dimensions',
                    name: 'question_type',
                    isSubTitle: true
                  },
                  {
                    title: 'Question',
                    name: 'question',
                    span: 10,
                    valueOf: (question, item) => {
                      return (
                        <Flex vertical gap={4}>
                          <div>Q:{question}</div>
                          {item.scale && (
                            <div>
                              <Typography.Paragraph
                                className={style['report-scale']}
                                ellipsis={{
                                  rows: 3,
                                  expandable: 'collapsible'
                                }}>
                                S:{item.scale}
                              </Typography.Paragraph>
                            </div>
                          )}
                        </Flex>
                      );
                    }
                  },
                  {
                    title: 'Summary',
                    name: 'summary',
                    span: 8
                  },
                  {
                    title: 'Conclusion',
                    name: 'pass',
                    span: 6,
                    valueOf: (pass, item) => {
                      //Relevancy
                      return (
                        <Flex vertical gap={12}>
                          <Row justify="space-between" gutter={[4, 0]} className={style['score-wrap']} wrap={false} flex={1}>
                            {Array(5)
                              .fill(0)
                              .map((score, index) => (
                                <Col key={index + 1} span={5} className={style['score-item-col']}>
                                  <Score score={item.relevancy} staticScore={index + 1} />
                                </Col>
                              ))}
                          </Row>
                          {item.scale && (
                            <Flex gap={8}>
                              <div>{pass ? <span className={style['pass-value']}>PASS</span> : <span className={style['fail-value']}>FAIL</span>}</div>
                              {item.critical && (
                                <div>
                                  <StateTag type="info" text="Critical" />
                                </div>
                              )}
                            </Flex>
                          )}
                        </Flex>
                      );
                    }
                  }
                ],
                footer: (item, index) => {
                  const flowData = get(data, 'results.flowData');
                  if (!flowData) {
                    return null;
                  }
                  const result = flowData.length >= 2 ? flowData.slice(0, -1).map((item, i) => [item, flowData[i + 1]]) : [];
                  if (!result[index]) {
                    return null;
                  }
                  const [start, end] = result[index];
                  const list = (get(data, 'results.messages') || []).slice(start, end + 1);
                  if (!(list && list.length > 0)) {
                    return null;
                  }

                  return <ChatMessage startTime={get(list, '[0].create_time')} list={list} agentAvatar={get(data, 'agent.avatar')} />;
                }
              }}
            />
          </ReportView>
        </>
      ) : (
        <Flex vertical gap={24}>
          <Alert message={'Generate report exception'} type="error" />
        </Flex>
      )}
    </Flex>
  );
});

export default Report;
