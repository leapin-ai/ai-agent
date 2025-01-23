import applicationDetail from './application-detail.json';

export { applicationDetail };

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
