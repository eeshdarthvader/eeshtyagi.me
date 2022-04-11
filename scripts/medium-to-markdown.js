const mediumToMarkdown = require('medium-to-markdown');
 
mediumToMarkdown.convertFromUrl('https://medium.com/@eesh.t/auto-detect-location-react-component-using-google-geocoding-and-reverse-geocoding-in-autocomplete-66a269c59315')
.then(function (markdown) {
  console.log(markdown); //=> Markdown content of medium post
});