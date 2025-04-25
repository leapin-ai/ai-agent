import applicationDetail from './application-detail.json';
import interviewReport from './interview-report.json';
import resumeData from './resume-data.json';

export { applicationDetail, interviewReport, resumeData };

const preset = {
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
