const getApis = options => {
  const { prefix } = Object.assign({}, { prefix: '/api' }, options);
  return {
    addAgent: {
      url: `${prefix}/agent/add/`,
      method: 'POST'
    },
    saveAgent: {
      url: `${prefix}/agent/{agent_id}/update/`,
      method: 'POST'
    },
    getAgentDetail: {
      url: `${prefix}/agent/{agent_id}/detail/`
    },
    getAgentList: {
      url: `${prefix}/agent/list/`,
      method: 'GET'
    },
    setAgentConfig: {
      url: `${prefix}/agent/{agent_id}/config/`,
      method: 'POST'
    },
    uploadKnowledge: {
      url: `${prefix}/agent/{agent_id}/knowledge/add/`,
      method: 'POST'
    },
    removeKnowledge: {
      url: `${prefix}/agent/knowledge/{knowledge_id}/delete/`,
      method: 'DELETE'
    },
    getKnowledgeList: {
      url: `${prefix}/agent/{agent_id}/knowledge/list/`,
      method: 'GET'
    }
  };
};

export default getApis;
