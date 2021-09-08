require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const giphyApi = process.env.GIPHY_API_KEY;
const giphyGifUrl = `http://api.giphy.com/v1/gifs/search?api_key=${giphyApi}&limit=10`;

function searchGifs(keyword, callback) {
  const url = giphyGifUrl + `&q=${keyword}`;
  axios
    .get(url)
    .then((response) => {
      callback(response);
    })
    .catch((e) => console.error(e));
}

module.exports = {
  searchGifs,
};
