const compileVariables = (props, variables) => {
  if (Array.isArray(props)) {
    return props.map(prop => {
      return compileVariables(prop, variables);
    });
  }
  if (props && props.toString() === '[object Object]' && Object.keys(props).length > 0) {
    const newProps = {};
    Object.keys(props).forEach(key => {
      newProps[key] = compileVariables(props[key], variables);
    });
    return newProps;
  }
  if (props && typeof props === 'string' && props.charAt(0) === '$' && variables[props.substring(1)]) {
    return variables[props.substring(1)];
  }

  return props;
};

export default compileVariables;
