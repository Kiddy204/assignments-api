const localConfiguration = () => ({
  ENDPOINT: 'mongodb+srv://root:root@cluster0.whays.mongodb.net/assignments_app?retryWrites=true&w=majority',
  // ENDPOINT:
  //   'mongodb+srv://arabexce_alpha_2021:oJIMYswzYAzUUSCk@arabexcellence.1owhj.mongodb.net/alpha_test_v6?retryWrites=true&w=majority',

  SECRET_KEY: 'i-am-from-local',
});

const prodConfiguration = () => ({
  ENDPOINT: process.env.MONGODB_URI,
  CLIENTS_URLS: process.env.CLIENT_URLS,
  SECRET_KEY: process.env.KEY_SECRET,
  GRAPHQL_PLAYGROUND: true,
  GRAPHQL_DEBUG: true,
});

let Configuration;
if (process.env.NODE_ENV === 'local') {
  Configuration = localConfiguration;
} else {
  Configuration = prodConfiguration;
}

export default Configuration;
