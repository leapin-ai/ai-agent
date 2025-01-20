import { Col, Row, Space } from 'antd';
import classnames from 'classnames';
import style from './style.module.scss';

const CheckList = ({ loading, value, options, onChange }) => {
  return (
    <Row gutter={8}>
      <Col>Please Select:</Col>
      <Col>
        <Space>
          {options.map(item => {
            return (
              <div
                className={classnames(style['message-condition-item'], {
                  [style['is-active']]: value === item.value,
                  [style['loading']]: loading
                })}
                key={item.value}
                onClick={() => {
                  onChange && onChange(item);
                }}
              >
                {item.label}
              </div>
            );
          })}
        </Space>
      </Col>
    </Row>
  );
};

export default CheckList;
