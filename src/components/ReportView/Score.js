import classnames from 'classnames';
import { Row, Col } from 'antd';
import style from './style.module.scss';

const ScoreItem = ({ score, staticScore }) => {
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

const Score = ({ className, value, total = 5 }) => {
  return (
    <Row justify="space-between" gutter={[4, 0]} className={classnames(className, style['score'])} wrap={false} flex={1}>
      {Array.from({ length: total }).map((n, index) => (
        <Col key={index + 1} span={5} className={style['score-item-col']}>
          <ScoreItem score={value} staticScore={index + 1} />
        </Col>
      ))}
    </Row>
  );
};

export default Score;
