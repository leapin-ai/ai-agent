import { Flex, Row, Col } from 'antd';
import get from 'lodash/get';
import style from './style.module.scss';

const List = ({ report }) => {
  return (
    <Flex vertical gap={16}>
      {get(report, 'list', []).map(({ label, content }, index) => {
        return (
          <Row wrap={false} key={index}>
            <Col span={3} className={style['list-label-col']}>
              <div className={style['list-label']}>{label}</div>
            </Col>
            <Col span={21} className={style['list-content-col']}>
              <div className={style['list-content']}>{content}</div>
            </Col>
          </Row>
        );
      })}
    </Flex>
  );
};

export default List;
