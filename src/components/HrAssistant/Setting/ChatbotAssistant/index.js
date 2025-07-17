import Basic from '../../Info/Basic';
import style from './style.module.scss';

const ChatbotAssistant = (props)=>{
  return <div className={style['container']}>
    <Basic {...props} />
  </div>
};

export default ChatbotAssistant;