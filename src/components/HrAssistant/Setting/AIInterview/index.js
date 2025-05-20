import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Flex, Pagination, Space } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import style from './style.module.scss';
import Fetch from '@kne/react-fetch';
import get from 'lodash/get';
import classnames from 'classnames';
import { Report } from '@components/InterviewAssistant';

const AIInterview = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Common@SearchInput',
    'components-core:InfoPage@TableView',
    'components-core:File@FileLink',
    'components-core:Modal@ModalButton',
    'components-ckeditor:Editor.Content',
    'components-core:StateTag',
    'components-core:ButtonGroup',
    'components-core:Icon'
  ]
})(({ remoteModules, type, baseUrl }) => {
  const [usePreset, SearchInput, TableView, FileLink, ModalButton, EditorContent, StateTag, ButtonGroup, Icon] = remoteModules;
  const { apis } = usePreset();
  const [keyword, setKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = searchParams.get('page') || 1,
    pageSize = 10;

  return (
    <Flex className={style['container']} vertical gap={24}>
      <Flex className={style['filter']} justify="space-between">
        <div></div>
        <div>
          <SearchInput className={style['search-input']} value={keyword} placeholder="search" onSearch={setKeyword} />
        </div>
      </Flex>
      <Fetch
        {...Object.assign({}, apis.agent.getSessionList, {
          params: { page, page_size: pageSize, keyword, use_scene: type }
        })}
        render={({ data, isComplete }) => {
          return (
            <Flex
              className={classnames('loading-container', {
                'is-loading': !isComplete
              })}
              vertical
              gap={8}
            >
              <TableView
                dataSource={data.results}
                columns={[
                  {
                    name: 'name',
                    title: 'Name',
                    getValueOf: item => {
                      return get(item, 'extra_info.data.resume.resumeData.name');
                    }
                  },
                  {
                    name: 'resume',
                    title: 'Resume',
                    getValueOf: item => get(item, 'extra_info.data.resume.src'),
                    render: item => {
                      return (
                        <FileLink title="Resume" src={item}>
                          Click Checked
                        </FileLink>
                      );
                    }
                  },
                  {
                    name: 'jobTitle',
                    title: 'Job title',
                    getValueOf: item => get(item, 'extra_info.data.jobTitle')
                  },
                  {
                    name: 'jd',
                    title: 'JD',
                    getValueOf: item => get(item, 'extra_info.data.jd'),
                    render: item => {
                      return (
                        <ModalButton
                          type="link"
                          className="btn-no-padding"
                          modalProps={{
                            title: 'JD',
                            children: <EditorContent>{item}</EditorContent>,
                            footer: null
                          }}
                        >
                          Click Checked
                        </ModalButton>
                      );
                    }
                  },
                  {
                    name: 'status',
                    title: 'Status',
                    getValueOf: item => get(item, 'summary_status') === 1 && get(item, 'status') === 2,
                    render: (item, { target }) => {
                      if (item && !!get(target, 'intent_summary.summary_by_llm.report.error')) {
                        return <StateTag type="danger" text="Error" />;
                      }
                      if (item) {
                        return <StateTag type="info" text="Ended" />;
                      }
                      return <StateTag type="progress" text="Progress" />;
                    }
                  },
                  {
                    name: 'start_time',
                    title: 'Start Time',
                    format: 'date-DD.MM.YYYY()HH:mm'
                  },
                  {
                    name: 'end_time',
                    title: 'End Time',
                    format: 'date-DD.MM.YYYY()HH:mm'
                  },
                  {
                    name: 'result',
                    title: 'Result',
                    getValueOf: item => get(item, 'intent_summary.summary_by_llm'),
                    render: (item, { target }) => {
                      return (
                        <ModalButton
                          type="link"
                          className="btn-no-padding"
                          modalProps={{
                            size: 'large',
                            children: <Report data={item} extraData={get(target, 'extra_info.data')} startTime={get(target, 'start_time')} endTime={get(target, 'end_time')} />,
                            footer: null
                          }}
                        >
                          Click checked
                        </ModalButton>
                      );
                    }
                  }
                ]}
              />
              <Flex justify="flex-end">
                <Pagination
                  showSizeChanger={false}
                  hideOnSinglePage
                  total={data.count}
                  current={page}
                  pageSize={pageSize}
                  onChange={page => {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.set('page', page);
                    setSearchParams(newSearchParams);
                  }}
                />
              </Flex>
            </Flex>
          );
        }}
      />
    </Flex>
  );
});

export default AIInterview;
