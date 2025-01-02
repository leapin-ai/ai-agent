import { Flex } from 'antd';
import style from './style.module.scss';
import AssistantHeader from './AssistantHeader';
import Info from './Info';

const HrAssistant = ({ item, baseUrl }) => {
  return (
    <Flex vertical gap={16}>
      <AssistantHeader baseUrl={baseUrl} name={'HR Assistant'} roles={['Interview', 'Hr Assistant']} />
      <Info item={item} />
    </Flex>
  );
};

export default HrAssistant;
