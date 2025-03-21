import { getPublicPath } from '@kne/remote-loader';

const key = 'default-avatar';
const getDefaultAvatar = () => {
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = Math.floor(Math.random() * 20) + 1;
    window.localStorage.setItem(key, value);
  }
  return `${getPublicPath('leapin-ai-agent')}/defaultAvatar/${value}.svg`;
};

export default getDefaultAvatar;
