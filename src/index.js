import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { connect } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { ApolloClient, HttpLink } from 'apollo-boost';
import { ApolloLink } from 'apollo-link';
import { RestLink } from 'apollo-link-rest';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import IndexPage from './pages/IndexPage'
import Experiments from './pages/Experiments'
import ConfigurationPage from './pages/Configuration'
import LicenseCheckPage from './pages/LicenseCheckPage'
import TestPage from './pages/TestPage'

import LoginForm from './pages/LoginForm'
import Header from './components/Header'
import rootReducer from './reducers'
import Modal from 'react-modal'
import { getCurrentUser } from "./actions/user";
import { getSite } from "./actions/site";
import { refreshFields } from './actions/environment';
import {
  MuiThemeProvider,
  createMuiTheme,
  // withStyles,
} from "@material-ui/core/styles";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEn from './locales/trans.en.json'
import translationKo from './locales/trans.ko.json'
import { TokenRefreshLink } from 'apollo-link-token-refresh';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: translationEn },
      ko: { translation: translationKo },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

const theme = createMuiTheme({
  typography: {
    // Tell Material-UI what's the font-size on the html element is.
    fontSize: 12,
    fontFamily: [
      'Source Code Pro',
      'Noto Sans KR',
      '-apple-system',
    //   'BlinkMacSystemFont',
    //   '"Segoe UI"',
    //   '"Helvetica Neue"',
    //   'Arial',
    //   'sans-serif',
    //   '"Apple Color Emoji"',
    //   '"Segoe UI Emoji"',
    //   '"Segoe UI Symbol"',
    ].join(',')
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1400,
      xl: 1920,
    },
  },
});

// Use at the root of your app
export const endpoint = localStorage.getItem('accutuning_endpoint') || "/api"

const authRestLink = new ApolloLink((operation, forward) => {
  operation.setContext(({headers}) => {
    return {
      headers: {
        ...headers,
        Accept: "application/json",
        authorization: `JWT ${localStorage.getItem('jwt')}`
      }
    };
  });
  return forward(operation).map(result => {
    // const r = operation.getContext();
    // console.log(r, result, localStorage.getItem('jwt'))
    // const authTokenResponse = r.response.find(res => res.headers.has("Authorization"));
    // // You might also filter on res.url to find the response of a specific API call
    // if (authTokenResponse) {
    //   localStorage.setItem("jwt", authTokenResponse.headers.get("Authorization"));
    // }
    return result;
  });
});

export const httpLink = new HttpLink({
  uri: endpoint + "/graphql",
  // headers: localStorage.getItem('jwt') ? {
  //     'authorization': `JWT ${localStorage.getItem('jwt')}`
  // } : null
});


// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:30000/graphql/`,
//   options: {
//     reconnect: true
//   }
// });

const restLink = new RestLink({ uri: endpoint});


// const link = split(
//   ({ query }) => {
//     const { kind, operation } = getMainDefinition(query);
//     return kind === "OperationDefinition" && operation === "subscription";
//   },
//   wsLink,
//   ApolloLink.from([restLink, httpLink])
// );
const isTokenExpired = () => {
  const expired = localStorage.getItem('jwtExpiredIn')
  if (expired) {
    return (new Date(expired * 1000) - new Date())/1000 <= 0
  }
  else {
    return false;
  }
}

const getAccessToken = () => localStorage.getItem('jwt')
const setAccessToken = (token) => localStorage.setItem('jwt', token)
const getRefreshToken = () => localStorage.getItem('jwtRefreshToken')
const setExpiresIn = (exp) => localStorage.setItem('jwtExpiredIn', exp)


const errorLink = new TokenRefreshLink({
  isTokenValidOrUndefined: () => !isTokenExpired() || typeof getAccessToken() !== 'string',
  fetchAccessToken: () => {
    return fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        'refresh-token': getRefreshToken()
      }
    });
  },
  handleFetch: accessToken => {
    const accessTokenDecrypted = accessToken;
    setAccessToken(accessToken);
    setExpiresIn(accessTokenDecrypted.exp);
  },
  handleResponse: (operation, accessTokenField) => response => {
    // here you can parse response, handle errors, prepare returned token to
    // further operations

    // returned object should be like this:
    // {
    //    access_token: 'token string here'
    // }
  },
  handleError: err => {
     // full control over handling token fetch Error
     console.warn('Your refresh token is invalid. Try to relogin');
     console.error(err);

     // your custom action here
    //  user.logout();
    alert('logout')
  }
})

export const client = new ApolloClient({
  // link,
  link: ApolloLink.from([errorLink, authRestLink, restLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
  // resolvers: {
  //   MlModelBaseType: {
  //     showDetail: (launch, _args, { cache }) => {
  //       return false
  //     },
  //   },
  //   Mutation: {
  //     toggleModelDetail: (_root, variables, { cache, getCacheKey }) => {
  //       const id = getCacheKey({__typename: 'MlModelBaseType', id: variables.id })
  //       const fragment = gql`
  //         fragment showModelDetail on MlModelBaseType {
  //           showDetail
  //         }
  //       `;
  //       const mlmodel = cache.readFragment({ fragment, id });
  //       const data = { ...mlmodel, showDetail: !mlmodel.showDetail };
  //       cache.writeData({ id, data })
  //       return null;
  //     }
  //   }
  // }
});

const middleware = [
  thunkMiddleware,
];

const store = createStore(rootReducer, {}, compose(
  applyMiddleware(...middleware),
  // Expose store to Redux DevTools extension.
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : func => func
));

Modal.setAppElement('#root')


const mapStateToProps = (state) => {
  return ({
      currentUser: state.user,
      loginUser: state.login,
      site: state.site,
  })
};

const LoginCheck = connect(mapStateToProps, null)(({currentUser, loginUser, site, dispatch}) => {
  useEffect(
    () => {
      dispatch(getSite())
      dispatch(getCurrentUser())
      dispatch(refreshFields())
    },
    [
      dispatch,
      // getCurrentUser,
      // getSite,
      // refreshFields,
    ]
  )

  if ((site.data === null && site.error === null) || site.loading) {
    return 'Hello, Accutuning is initializing..'
  }

  if (site.error) {
    return <div>
      <ConfigurationPage/>
    </div>
  }
  // if ((currentUser.data === null && currentUser.error === null) || currentUser.loading)
  if (currentUser.loading)
    return 'Almost done, checking the user..'

  // console.log(site, currentUser, loginUser)
  const useLogin = (
    site.data.ACCUTUNING_AUTH &&
    (
      currentUser.data === null ||
      !currentUser.data.username ||
      currentUser.data.needToChangePassword ||
      currentUser.error !== null
    )
  )

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
      <Route path="/configuration">
        <ConfigurationPage/>
      </Route>
      {
        useLogin ?
          <LoginForm/>
          :
          <>
            <Route path="/about">
                <IndexPage/>
            </Route>
            <Route path="/configuration">
              <ConfigurationPage/>
            </Route>
            <Route path="/license">
              <LicenseCheckPage/>
            </Route>
            <Route path="/_test">
              <TestPage/>
            </Route>
            <Route path="/c/:id/text">
            </Route>
            <Route path="/">
              <Experiments/>
            </Route>
          </>
      }
      </Switch>
    </Router>
  )
})

ReactDOM.render(
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <Header/>
            <LoginCheck/>
            <ToastContainer/>
          </MuiThemeProvider>
        </Provider>
      </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
