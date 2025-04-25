import ReportView from '@components/ReportView';
import { Flex } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';
import { useRef } from 'react';

const Report = createWithRemoteLoader({
  modules: ['components-core:File@PrintButton']
})(({ remoteModules, data, extraData, startTime, endTime }) => {
  const [PrintButton] = remoteModules;
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
          )}
          <ReportView.PrintPageBreak />
          {get(data, 'report.candidate') && (
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
          )}
          <ReportView.PrintPageBreak />
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
        </Flex>
      </div>
    </div>
  );
});

export default Report;
