import style from './style.module.scss';
import { Flex } from 'antd';
import classnames from 'classnames';

const PageHeader = ({ className, title, description }) => {
  return (
    <Flex vertical gap={4} className={classnames(className, style['page-header'])}>
      <div className={style['title']}>
        <i />
        {title}
      </div>
      {description && <div className={style['description']}>{description}</div>}
    </Flex>
  );
};

export default PageHeader;
