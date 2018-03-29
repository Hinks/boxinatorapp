export function postBox(fetch, box){

  const init = {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(box),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  return fetch("http://localhost:8080/api/savebox", init)
    .then(res => res.json())
    .then(handleResponse)
}

export function getBoxes(fetch){
  return fetch("http://localhost:8080/api/boxes", {mode: "cors"})
    .then(res => res.json())
    .then(handleResponse)
}

export function getStatisticsAboutBoxes(fetch){
  return fetch("http://localhost:8080/api/stats/boxes", {mode: "cors"})
    .then(res => res.json())
    .then(handleResponse)
}

function handleResponse(response){
  if (!("error" in response)) {
    return response.data
  } else {
    const {message, ...otherErrors} = response.error
    const error = new Error(message)
    return Promise.reject(Object.assign(error, { ...otherErrors }))
  }
}