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
    getSessionList: {
      url: `${prefix}/agent/saas/session/list/`,
      method: 'GET'
    },
    getApplicationList: {
      url: `${prefix}/agent/{agent_id}/application/list/`,
      method: 'GET'
    },
    getSignature: {
      url: `${prefix}/agent/conference/sign/`,
      method: 'GET'
    },
    getApplicationDetail: {
      url: `${prefix}/candidate/candidate/applications/detail/{applications_id}/`,
      method: 'GET'
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
      sendSessionMessageStream: {
        url: `${prefix}/agent/saas/session/{session_id}/stream_message/send/`,
        method: 'POST'
      },
      getSideInfo: {
        url: `${prefix}/api/agent/{agent_id}/message/intent_identification/`,
        method: 'GET'
      },
      saveSession: {
        url: `${prefix}/agent/saas/session/{session_id}/update/`,
        method: 'PUT'
      },
      rtasrSign: {
        url: `${prefix}/agent/saas/{agent_id}/rtasr/iflytek/sign/`,
        method: 'GET'
      }
    },
    job: {
      getJobList: {
        url: `${prefix}/jobs/jobs/status/filter/`,
        method: 'GET'
      },
      deliverJob: {
        url: `${prefix}/jobs/application_record/bulk_add/`,
        method: 'POST'
      },
      resend: {
        url: `${prefix}/agent/{agent_id}/application/{application_id}/resend/`,
        method: 'POST'
      },
      rejected: {
        url: `${prefix}/candidate/candidate/applications/change_status/`,
        method: 'POST'
      },
      resumeParse: {
        url: `${prefix}/resume/parser_resume/`,
        method: 'POST'
      }
    },
    chatBotClient: {
      getTokenByCode: {
        url: `${prefix}/agent/chatbot/code/verify/`,
        method: 'POST'
      },
      getSessionDetail: {
        url: `${prefix}/agent/chatbot/session/{session_id}/detail/`,
        method: 'GET'
      },
      sendSessionMessage: {
        url: `${prefix}/agent/chatbot/session/{session_id}/message/send/`,
        method: 'POST'
      },
      sendSessionMessageStream: {
        url: `${prefix}/agent/chatbot/session/{session_id}/stream_message/send/`,
        method: 'POST'
      },
      getSideInfo: {
        url: `${prefix}/api/agent/{agent_id}/message/intent_identification/`,
        method: 'GET'
      },
      saveSession: {
        url: `${prefix}/agent/chatbot/session/{session_id}/update/`,
        method: 'PUT'
      },
      createChatBot: {
        url: `${prefix}/agent/anonymous/code/`,
        method: 'POST'
      },
      getSpeechToken: {
        url: `${prefix}/agent/{agent_id}/asr/ali/token/`
      }
    },
    videoConference: {
      createRoom: {
        url: `${prefix}/v1/conference/open-api/create`,
        method: 'POST'
      },
      getDetail: {
        url: `${prefix}/v1/conference/open-api/detail`,
        method: 'GET'
      }
    }
  };
};

export default getApis;
