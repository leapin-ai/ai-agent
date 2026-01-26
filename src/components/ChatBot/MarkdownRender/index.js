import React, { useMemo, Fragment } from 'react';
import markdown from 'markdown-it';
import mdComponents from './markdown-it-components';
import compileVariables from './compileVariables';
import useRefCallback from '@kne/use-ref-callback';
import merge from 'lodash/merge';
import preset, { globalParams } from './preset';
import htmlParser from 'html-react-parser';

const MarkdownComponentsRender = ({ children = '', render: customRender, ...props }) => {
  const { htmlTransform, components = {}, variables = {}, options } = merge({}, globalParams, props);
  const render = useRefCallback(children => {
    const { config, plugins } = Object.assign({}, options, {
      config: {},
      plugins: []
    });

    const md = markdown(config);
    plugins.forEach(plugin => {
      const pluginArgs = Array.isArray(plugin) ? plugin : [plugin];
      md.use(...pluginArgs);
    });
    md.use(mdComponents);

    const html = md.render(children);
    const root = document.createElement('div');
    root.innerHTML = typeof htmlTransform === 'function' ? htmlTransform(html) : html;
    return [].slice.call(root.children).map((element, index) => {
      if (element.className === 'yaml-components' && element.dataset.components) {
        const componentsData = JSON.parse(element.dataset.components);
        if (!componentsData['md-components']) {
          return null;
        }
        const { type, props } = componentsData['md-components'];
        const MdComponent = components[type];
        if (!MdComponent) {
          return null;
        }
        return <MdComponent {...Object.assign({}, compileVariables(props, variables))} key={index} />;
      }

      return <Fragment key={index}>{htmlParser(element.outerHTML)}</Fragment>;
    });
  });

  const result = useMemo(() => {
    return render(children);
  }, [children, render]);

  if (typeof customRender === 'function') {
    return customRender(result);
  }

  return result;
};

export default MarkdownComponentsRender;
export { preset };
