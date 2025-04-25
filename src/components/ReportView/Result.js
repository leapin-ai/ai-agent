import { Row, Col } from 'antd';
import get from 'lodash/get';
import style from './style.module.scss';

const Result = ({ report }) => {
  const totalScore = get(report, 'total.score');
  const totalLabel = get(report, 'total.label');
  const list = get(report, 'list', []);
  return (
    <Row wrap={false} gutter={16} className={style['result-view']}>
      <Col span={3}>
        <div className={style['result-total']}>
          <div className={style['result-total-score']}>{totalScore}</div>
          <div className={style['result-total-label']}>{totalLabel}</div>
        </div>
      </Col>
      <Col span={21}>
        <div className={style['result-list']}>
          {list.map(({ label, content, score }, index) => {
            return (
              <div className={style['result-item']} key={index}>
                <div className={style['result-item-label']}>
                  {label}：<span className={style['result-item-score']}>{score}</span>
                </div>
                <div className={style['result-item-content']}>{content}</div>
              </div>
            );
          })}
        </div>
      </Col>
    </Row>
  );
};

export default Result;
