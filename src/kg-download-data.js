let https   = require('https');
let querystring = require('querystring');
let fs      = require('fs');

const cookies = '' // < COPY A COOKIE HEADER HERE >;
let album = {
  year: '2017', // < TYPE A YEAR AS STRING >
  month: '05' // < TYPE A MONTH NUMBER AS STRING >
}

loadAlbum(cookies, album);

function loadAlbum(cookiesHeader, albumId) {
  const dataAlbum = querystring.stringify(albumId);

  let optionsAlbum = {
    hostname  : 'kindergarden.flexkids.nl',
    port      : 443,
    path      : '/ouder/fotoalbum/standaardalbum',
    method    : 'POST',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Length': Buffer.byteLength(dataAlbum),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': cookiesHeader,
      'Host': 'kindergarden.flexkids.nl',
      'Origin': 'https://kindergarden.flexkids.nl',
      'Referer': 'https://kindergarden.flexkids.nl/ouder/fotoalbum',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  let folder = `KinderGarden/${albumId.year}${albumId.month}`;

  if(!fs.existsSync(folder)) {
    console.log('ALBUM FOLDER doesn\'t yet exist and will be created');
    fs.mkdirSync(folder);
  }

  let albumData = '';
  let fileName = `${folder}/album.json`;
  let fileAlbum = fs.createWriteStream(fileName);

  let requestAlbum = https.request(optionsAlbum, (response) => {
    console.log("ALBUM RESPONSE: statuscode = ", response.statusCode);
    console.log("ALBUM RESPONSE: headers = ", response.headers);

    response.on('data', (data) => {
      console.log(`ALBUM DATA RECEIVED for ${albumId.year}${albumId.month}`);
      fileAlbum.write(data);
      albumData += data;
    });

    response.on('end', () => {
      console.log('ALBUM DATA: No more data in response.');
      const album = JSON.parse(albumData);

      for(let index = 0; index < album['FOTOS'].length; index++) {
        const photoId = album['FOTOS'][index];
        loadMeta(cookiesHeader, folder, photoId);
        loadImage(cookiesHeader, folder, photoId);
      }
    });
  });

  requestAlbum.on('error', (error) => {
    console.log(`ALBUM: Problem with request: ${error.message}`);
  });

  requestAlbum.write(dataAlbum);
  requestAlbum.end();
}

function loadMeta(cookiesHeader, folder, id) {
  const dataMeta = querystring.stringify({
    id  : id
  });

  let optionsMeta = {
    hostname  : 'kindergarden.flexkids.nl',
    port      : 443,
    path      : '/ouder/fotoalbum/fotometa/',
    method    : 'POST',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Length': Buffer.byteLength(dataMeta),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': cookiesHeader,
      'Host': 'kindergarden.flexkids.nl',
      'Origin': 'https://kindergarden.flexkids.nl',
      'Referer': 'https://kindergarden.flexkids.nl/ouder/fotoalbum',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  let fileName = `${folder}/${id}-meta.json`;
  let fileImage = fs.createWriteStream(fileName);

  let requestMeta = https.request(optionsMeta, (response) => {
    console.log("META RESPONSE: statuscode = ", response.statusCode);
    console.log("META RESPONSE: headers = ", response.headers);

    response.on('data', (data) => {
      console.log(`META ${id} WRITE: fileName = `, fileName);
      fileImage.write(data);
    });

    response.on('end', () => {
      console.log('No more data in response.');
    });
  });

  requestMeta.on('error', (error) => {
    console.log(`Problem with request: ${error.message}`);
  });

  requestMeta.write(dataMeta);
  requestMeta.end();
}

function loadImage(cookiesHeader, folder, id) {

  let optionsImage = {
    hostname  : 'kindergarden.flexkids.nl',
    port      : 443,
    path      : `/ouder/media/mediajpg/media/${id}/formaat/groot/`,
    method    : 'GET',
    headers: {
      'Accept': 'image/webp,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Cookie': cookiesHeader,
      'Host': 'kindergarden.flexkids.nl',
      'Referer': 'https://kindergarden.flexkids.nl/ouder/fotoalbum',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36'
    }
  };

  let fileName = `${folder}/${id}.jpg`;
  let fileImage = fs.createWriteStream(fileName);

  let requestImage = https.request(optionsImage, (response) => {
    console.log(`IMAGE ${id} RESPONSE: statuscode = `, response.statusCode);
    console.log(`IMAGE ${id} RESPONSE: headers = `, response.headers);

    response.on('data', (data) => {
      console.log(`IMAGE ${id} WRITE: fileName = `, fileName);
      fileImage.write(data);
    });

    response.on('end', () => {
      console.log('No more data in response.');
      return;
    });
  });

  requestImage.end();
}