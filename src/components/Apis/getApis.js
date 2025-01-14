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
    duplicateAgent: {
      url: `${prefix}/agent/{agent_id}/duplicate/`,
      method: 'PUT'
    },
    removeAgent: {
      url: `${prefix}/agent/{agent_id}/delete/`,
      method: 'DELETE'
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
    },
    saveKnowledge: {
      url: `${prefix}/agent/knowledge/{knowledge_id}/update/`,
      method: 'PUT'
    },
    chatBot: {
      addSession: {
        url: `${prefix}/api/agent/saas/session/add/`,
        method: 'POST'
      },
      getSessionDetail: {
        url: `${prefix}/agent/saas/session/{session_id}/detail/`,
        method: 'GET'
      },
      sendSessionMessage: {
        url: `${prefix}/agent/saas/session/{session_id}/message/send/`,
        method: 'POST'
      },
      saveSession: {
        url: `${prefix}/agent/saas/session/{session_id}/update/`,
        method: 'PUT'
      }
    },
    job: {
      getJobList: {
        url: `${prefix}/jobs/jobs/status/filter/`,
        method: 'GET'
      }
    },
    chatBotClient: {
      getTokenByCode: {
        url: `${prefix}/agent/chatbot/code/verify/`,
        method: 'POST'
      }
    }
  };
};

export default getApis;
