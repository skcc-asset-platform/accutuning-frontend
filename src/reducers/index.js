import { combineReducers } from 'redux';

import workspace from "./workspace";
import source from "./source";
import sources from "./sources";
import environment from "./environment";
import user from "./user"
import login from "./login"
import site from "./site"
// import dataset from "./dataset";
// import columns from "./columns";
// import runtime from "./runtime";
// import runtimes from "./runtimes";
// import leaderboard from "./leaderboard";
// import deployment from "./deployment";
// import models from "./models";
// import dockercontainers from "./dockercontainers";

export default combineReducers({
    workspace,
    sources,
    user,
    login,
    site,
    // runtimes,
    // dockercontainers,
    source,
    environment,
    // dataset,
    // columns,
    // models,
    // runtime,
    // leaderboard,
    // deployment
});
