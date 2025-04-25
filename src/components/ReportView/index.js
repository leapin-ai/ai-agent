import style from './style.module.scss';
import { Flex } from 'antd';
import List from './List';
import Result from './Result';
import Table from './Table';
import Part from './Part';
import Score from './Score';
import PrintPageBreak from './PrintPageBreak';
import classNames from 'classnames';

const ReportView = ({ title, subtitle, extra, className, border, children }) => {
  return (
    <div
      className={classNames(
        style['report-view'],
        {
          [style['no-title']]: !(title || extra),
          [style['no-border']]: border === false
        },
        className
      )}
    >
      <Flex className={style['title-outer']} justify="space-between">
        {title && (
          <Flex vertical>
            <div className={style['title']}>{title}</div>
            {subtitle && <div className={style['subtitle']}>{subtitle}</div>}
          </Flex>
        )}
        {extra && <div className={style['title-extra']}>{extra}</div>}
      </Flex>
      {children}
    </div>
  );
};

ReportView.List = List;
ReportView.Result = Result;
ReportView.Table = Table;
ReportView.Part = Part;
ReportView.Score = Score;
ReportView.PrintPageBreak = PrintPageBreak;

export default ReportView;
