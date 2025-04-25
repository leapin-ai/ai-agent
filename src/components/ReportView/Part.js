import { Space } from 'antd';
import get from 'lodash/get';
import classnames from 'classnames';
import style from './style.module.scss';

const Part = ({ report }) => {
  return (
    <Space direction="vertical" size={32}>
      {get(report, 'list', []).map(({ label, content, hasBgColor, ...props }, index) => {
        return (
          <div {...props} key={index}>
            <div className={style['part-label']}>{label}</div>
            <div
              className={classnames(style['part-content'], {
                [style['has-bg-color']]: hasBgColor
              })}
            >
              {content}
            </div>
          </div>
        );
      })}
    </Space>
  );
};

export default Part;
