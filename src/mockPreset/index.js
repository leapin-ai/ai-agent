import applicationDetail from './application-detail.json';
import interviewReport from './interview-report.json';
import interviewStage from './interview-stage.json';
import resumeData from './resume-data.json';
import { enums } from '../components/InterviewAssistant';

export { applicationDetail, interviewReport, interviewStage, resumeData };

const preset = {
  enums: Object.assign({}, enums),
  apis: {
    agent: {
      getApplicationDetail: {
        loader: () => {
          return applicationDetail.data;
        }
      }
    }
  }
};

export default preset;
