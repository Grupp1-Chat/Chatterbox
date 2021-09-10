require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const giphyApi = process.env.GIPHY_API_KEY;
const emojiApi = process.env.EMOJI_API_KEY;
const stickerApi = process.env.STICKER_API_KEY;
const giphyGifUrl = `http://api.giphy.com/v1/gifs/search?api_key=${giphyApi}&limit=10`;
const emojiApiUrl = `https://emoji-api.com/emojis?access_key=${emojiApi}&search=`;
const emojiUrl = `https://emoji-api.com/categories/smileys-emotion?access_key=${emojiApi}`;
const stickerUrl = `https://api.mojilala.com/v1/stickers/search?api_key=${stickerApi}&q=`;

function searchGifs(keyword, callback) {
  const url = giphyGifUrl + `&q=${keyword}`;
  axios
    .get(url)
    .then((response) => {
      callback(response);
    })
    .catch((e) => console.error(e));
}

function searchStickers(keyword, callback) {
  const query = keyword.split(" ").join("+");
  const url = stickerUrl + `&q=${query}`;
  axios
    .get(url)
    .then((response) => {
      callback(response.data);
    })
    .catch((e) => console.error(e));
}

function getAllEmojis(callback) {
  axios
    .get(emojiUrl)
    .then((response) => callback(response.data))
    .catch((e) => console.error(e));
}

function searchEmojis(query, callback) {
  const url = emojiApiUrl + query;
  axios
    .get(url)
    .then((response) => callback(response.data))
    .catch((e) => console.error(e));
}

module.exports = {
  searchGifs,
  searchStickers,
  getAllEmojis,
  searchEmojis,
};
