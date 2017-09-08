// !!!FILL IN YOUR CLIENT ID FROM YOUR APPLICATION CONSOLE:
// https://developer.spotify.com/my-applications/#!/applications !!!

const CLIENT_ID = "6a7514bb9d5042699203c0faf8bfac34";

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;

const getArtist = function (name) {
  const query = {
      q: name,
      limit: 1,
      type: 'artist'
  }
  return getFromApi("search", query)
    .then(item => {
      artist = item.artists.items[0];
      let endpoint = `artists/${artist.id}/related-artists`;
      return getFromApi(endpoint);
    })
    .then( item => {
          // console.log(item); 
          artist.related = item.artists;
          let artistarr = artist.related; 
          const promiseArr = []; 
          for (let i = 0; i < artistarr.length; i++ ){
            let endpoint2 = `artists/${artistarr[i].id}/top-tracks/`;
            promiseArr.push(getFromApi(endpoint2, {country: "US"})); 
          }
          return Promise.all(promiseArr);  
    }) 
    .then(responses => { 
      for(let i = 0; i < responses.length; i++){
          artist.related[i].tracks = responses[i].tracks; 
      }
      // console.log(tracks);
      return artist; 
    })
    .catch(function(err){
      console.log("Here is the error: " + err);
    });
  // Edit me!
  // (Plan to call `getFromApi()` several times over the whole exercise from here!)
};


// getArtist.then(response => {
//   artist = item.artists.items[0];
//   return artist; 
// });



// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
