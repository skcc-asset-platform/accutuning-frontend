const fetch = global.fetch;
const Headers = global.Headers;

const REQUEST_TIMEOUT = 15000;
const DEFAULT_ENDPOINT_URL = localStorage.getItem('accutuning_endpoint') || "/api";
// const ENDPOINT_URL = localStorage.getItem('accutuning_endpoint') || DEFAULT_ENDPOINT_URL
const ENDPOINT_URL = DEFAULT_ENDPOINT_URL

const checkStatus = async (response) =>  {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  console.log(response.status, localStorage.getItem('jwt'))
  if (response.status === 401) {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      localStorage.removeItem('jwt')
      window.location = process.env.PUBLIC_URL
    }
  }
  // const error = new Error(response);
  // throw response;
  const error = await parseJSON(response)
  throw error.message || error.messages || response.statusText
};

// const parseJSON = response => response ? response.json() : null
const parseJSON = (response) => {
  const rxOne = /^[\],:{}\s]*$/;
  const rxTwo = /\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  const rxThree = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g;
  const rxFour = /(?:^|:|,)(?:\s*\[)+/g;
  const isJSON = (input) => (
    input.length && rxOne.test(
      input.replace(rxTwo, '@')
        .replace(rxThree, ']')
        .replace(rxFour, '')
    )
  );
  return response.text().then(function(text) {
    return isJSON(text) ? JSON.parse(text) : {}
  })
}

// Response timeout cancelling the promise (not the request).
// See https://github.com/github/fetch/issues/175#issuecomment-216791333.
const timeout = (ms, promise) => {
  const race = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Response timeout'));
    }, ms);

    promise.then((res) => {
      clearTimeout(timeoutId);
      resolve(res);
    }, (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });

  return race;
};

/**
 * Wrapper around fetch with sane defaults for behavior in the face of
 * errors.
 */
const request = (method, url, data) => {
  let options = {
    credentials: 'same-origin',
    method: method,
    body: JSON.stringify(data),
  };

  const jwt = localStorage.getItem('jwt')
  if (jwt) {
    options.headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `JWT ${jwt}`
    })
  }
  else {
    options.headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
    })
  }

  if (url.indexOf(ENDPOINT_URL) !== 0) {
    url = ENDPOINT_URL + url
  }

  return timeout(REQUEST_TIMEOUT, fetch(url, options))
    .then(checkStatus)
    .then(parseJSON);
};


const requestFileUpload = (url, data) => {
  const options = {
    // credentials: 'same-origin',
    // headers: new Headers({
    //   // 'Content-Type': 'application/x-www-form-urlencoded',
    //   'Accept': 'application/json',
    // }),
    credentials: 'same-origin',
    method: 'POST',
    body: data,
  };
  const jwt = localStorage.getItem('jwt')
  if (jwt) {
    options.headers = new Headers({
      'Accept': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `JWT ${jwt}`
    })
  }
  else {
    options.headers = new Headers({
      'Accept': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    })
  }
  if (url.indexOf(ENDPOINT_URL) !== 0 && DEFAULT_ENDPOINT_URL) {
    url = ENDPOINT_URL + url
  }

  console.log(url, options)
  return fetch(url, options)
};

export const get = url => request('GET', url);
export const del = url => request('DELETE', url);
export const post = (url, data) => request('POST', url, data);
export const put = (url, data) => request('PUT', url, data);
export const patch = (url, data) => request('PATCH', url, data);
export const graphql = (query) => request('POST', ENDPOINT_URL + '/graphql', {query});
export const filepost = (url, data) => requestFileUpload(url, data);
