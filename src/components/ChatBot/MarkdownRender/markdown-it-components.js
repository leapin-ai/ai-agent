import yaml from 'js-yaml';
import Ajv from 'ajv';

const ajv = new Ajv();

const mdComponentsSchema = {
  type: 'object',
  properties: {
    'md-components': {
      type: 'object',
      properties: {
        type: { type: 'string' },
        props: { type: 'object' }
      },
      required: ['type', 'props']
    }
  },
  required: ['md-components']
};

const validate = ajv.compile(mdComponentsSchema);

const mdComponents = function (md) {
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.info.trim() === 'yml') {
      try {
        const jsonData = yaml.load(token.content);
        if (validate(jsonData)) {
          const element = document.createElement('pre');
          element.setAttribute('class', 'yaml-components');
          element.dataset.components = JSON.stringify(jsonData);
          return element.outerHTML;
        }
      } catch (e) {}
    }
    return defaultFence(tokens, idx, options, env, self);
  };
};

export default mdComponents;
