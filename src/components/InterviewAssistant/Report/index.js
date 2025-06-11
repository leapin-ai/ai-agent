import { Flex, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { useRef } from 'react';

const Report = createWithRemoteLoader({
  modules: ['components-core:File@PrintButton', 'components-core:InfoPage@Report', 'components-core:InfoPage']
})(({ remoteModules, data, extraData, startTime, endTime }) => {
  const [PrintButton, ReportView, InfoPage] = remoteModules;
  const contentRef = useRef(null);
  return (
    <div className={style['report-outer']}>
      <PrintButton icon={<PrinterOutlined />} shape="round" contentRef={contentRef} className={style['print-btn']}>
        Print
      </PrintButton>
      <div ref={contentRef}>
        <Flex className={style['report']} vertical gap={24}>
          <ReportView border={false}>
            <h1>面试报告</h1>
            <Flex gap={20}>
              <div>姓名:{get(extraData, 'resume.resumeData.name', 'Default')}</div>
              <div>面试职位:{get(extraData, 'jobTitle') || ''}</div>
              <div>面试时间: {startTime || ''}</div>
            </Flex>
          </ReportView>
          {get(data, 'report.interviewer') && (
            <>
              <ReportView title="面试官表现评分(1-5分，5=优秀)" border={false}>
                <Flex vertical gap={24}>
                  <ReportView.Table
                    report={{
                      columns: [
                        {
                          title: '评估维度',
                          name: 'title',
                          span: 6
                        },
                        {
                          title: '评分',
                          name: 'score',
                          valueOf: value => <ReportView.Score value={value} />,
                          span: 4
                        },
                        {
                          title: '具体表现建议',
                          name: 'description',
                          span: 14
                        }
                      ],
                      list: get(data, 'report.interviewer.metrics')
                    }}
                  />
                  <ReportView.Part
                    report={{
                      list: [
                        {
                          label: '总结',
                          hasBgColor: true,
                          content: (
                            <ul>
                              {get(data, 'report.interviewer.summary.advantage') && (
                                <li>
                                  <span className="content-title">优点:</span>
                                  <ul>
                                    {get(data, 'report.interviewer.summary.advantage').map((item, index) => {
                                      return <li key={index}>{item}</li>;
                                    })}
                                  </ul>
                                </li>
                              )}
                              {get(data, 'report.interviewer.summary.improvement') && (
                                <li className="warning">
                                  <span className="content-title warning">改进点:</span>
                                  <ul>
                                    {get(data, 'report.interviewer.summary.improvement').map((item, index) => {
                                      return (
                                        <li className="warning" key={index}>
                                          {item}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </li>
                              )}
                            </ul>
                          )
                        }
                      ]
                    }}
                  />
                </Flex>
              </ReportView>
              <ReportView.PrintPageBreak />
            </>
          )}
          {get(data, 'report.candidate') && (
            <>
              <ReportView title="候选人能力评估(1-5分，5=优秀)" subtitle="基于面试回答与测试结果" border={false}>
                <Flex vertical gap={24}>
                  <ReportView.Table
                    report={{
                      columns: [
                        {
                          title: '评估维度',
                          name: 'title',
                          span: 6
                        },
                        {
                          title: '评分',
                          name: 'score',
                          valueOf: value => <ReportView.Score value={value} />,
                          span: 4
                        },
                        {
                          title: '关键证据',
                          name: 'comment',
                          span: 6
                        },
                        {
                          title: '分析逻辑',
                          name: 'description',
                          span: 8
                        }
                      ],
                      list: get(data, 'report.candidate.metrics')
                    }}
                  />
                  <ReportView.Part
                    report={{
                      list: [
                        {
                          label: '风险与潜力分析',
                          hasBgColor: true,
                          content: (
                            <ul>
                              {get(data, 'report.candidate.summary') && (
                                <li>
                                  <span className="content-title">优势:</span>
                                  <ul>
                                    {get(data, 'report.candidate.summary.advantage').map((item, index) => {
                                      return <li key={index}>{item}</li>;
                                    })}
                                  </ul>
                                </li>
                              )}
                              {get(data, 'report.candidate.summary.improvement') && (
                                <li className="error">
                                  <span className="content-title error">风险点:</span>
                                  <ul>
                                    {get(data, 'report.candidate.summary.improvement').map((item, index) => {
                                      return (
                                        <li className="error" key={index}>
                                          {item}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </li>
                              )}
                            </ul>
                          )
                        }
                      ]
                    }}
                  />
                </Flex>
              </ReportView>
              <ReportView.PrintPageBreak />
            </>
          )}
          {get(data, 'report.improvement.interviewer') && (
            <ReportView title="改进建议" border={false}>
              <ReportView.Part
                report={{
                  list: [
                    {
                      label: '对面试官',
                      hasBgColor: true,
                      style: { '--marker-color': '#027A48', '--label-bg-color': '#027A481a' },
                      content: (
                        <ol>
                          {get(data, 'report.improvement.interviewer').map((item, index) => {
                            return <li key={index}>{item}</li>;
                          })}
                        </ol>
                      )
                    }
                  ]
                }}
              />
            </ReportView>
          )}
          {get(data, 'report.summary') && data.report.summary.length > 0 && (
            <ReportView title="面试详情" border={false}>
              <Flex vertical gap={12}>
                {data.report.summary.map((item, index) => {
                  if (item.type === 'section') {
                    return <InfoPage.Part key={index} title={item.content}></InfoPage.Part>;
                  }
                  if (item.type === 'question') {
                    return (
                      <InfoPage.Part key={index}>
                        <InfoPage.Part title={item.time}>
                          <Typography.Paragraph className={style['question-title']}>
                            <Typography.Text className={style['question-role']}>{item.role}:</Typography.Text>
                            {item.content}
                          </Typography.Paragraph>
                        </InfoPage.Part>
                      </InfoPage.Part>
                    );
                  }

                  return (
                    <Typography.Paragraph key={index}>
                      <Typography.Text className={style['question-role']}>{item.role}:</Typography.Text>
                      {item.content}
                    </Typography.Paragraph>
                  );
                })}
              </Flex>
            </ReportView>
          )}
          {get(data, 'report.error') && (
            <ReportView title="错误" border={false}>
              <ReportView.Part
                report={{
                  list: [
                    {
                      label: '错误详情',
                      hasBgColor: true,
                      style: { '--marker-color': '#f66969', '--label-bg-color': '#f669691a' },
                      content: get(data, 'report.error')
                    }
                  ]
                }}
              />
            </ReportView>
          )}
        </Flex>
      </div>
    </div>
  );
});

export default Report;
