const fs      = require('fs');
const exiftool = require('node-exiftool');
const etp = new exiftool.ExiftoolProcess();

const albumRange = {
  'from': {
    'year': 2017, // < TYPE A YEAR AS INT >
    'month': 3 // < TYPE A MONTH NUMBER AS INT >
  },
  'to': {
    'year': 2017, // < TYPE A YEAR AS INT >
    'month': 5 // < TYPE A MONTH NUMBER AS INT >
  }
}

let albumIndex = {
  'year': albumRange.from.year,
  'month': albumRange.from.month
}

updateAlbum(parseStringAlbum(albumIndex));

function parseStringAlbum (album) {

  return {
    'year': '' + album.year,
    'month': album.month < 10 ? '0' + album.month : album.month
  }
}

function nextMonth() {

  if (albumIndex.year === albumRange.to.year && albumIndex.month === albumRange.to.month) {
    console.log("Reached end of range");
    return;
  }

  if (albumIndex.month === 12) {
    albumIndex.year += 1;
    albumIndex.month = 1;
    console.log("Proceeding to next year", albumIndex.year);
  } else {
    albumIndex.month += 1;
    console.log("Proceeding to next month", albumIndex.month);
  }

  updateAlbum(parseStringAlbum(albumIndex));
}


function updateAlbum(album) {

  let folder = `KinderGarden/${album.year}${album.month}`;

  const albumFileContents = fs.readFileSync(`${folder}/album.json`);
  const albumContents = JSON.parse(albumFileContents)['FOTOS'];

  // Writing process
  let etProcess = etp.open()
      .then((pid) => console.log('Started exiftool write process %s', pid));

  for(let index = 0; index < albumContents.length; index++) {
    const photoId = albumContents[index];
    const filePath = `${folder}/${photoId}.jpg`;
    const metaPath = `${folder}/${photoId}-meta.json`;

    const createDate = getMetaData(metaPath);

    etProcess.then(() => etp.writeMetadata(filePath, {
        'Creator': 'KinderGarden',
        'DateTimeOriginal': createDate,
        // 'FileCreateDate': createDate,
        'FileModifyDate': createDate
      }, ['overwrite_original']))
      .then(console.log, console.error);
  }

  etProcess.then(() => etp.close())
      .then(() => console.log('Closed exiftool for writing'), console.error)
      .then(() => runReadProcess(albumContents, folder));
 }

 function runReadProcess(albumContents, folder) {

  // Reading process
  etProcess = etp.open()
      .then((pid) => console.log('Started exiftool read process %s', pid));

  for(let index = 0; index < albumContents.length; index++) {
    const photoId = albumContents[index];
    const filePath = `${folder}/${photoId}.jpg`;

    etProcess.then(() => etp.readMetadata(filePath, ['Creator', 'DateTimeOriginal', 'FileCreateDate', 'FileModifyDate', 'FileAccessDate']))
      .then(console.log, console.error);
  }

  etProcess.then(() => etp.close())
    .then(() => console.log('Closed exiftool for reading'), console.error)
    .then(() => nextMonth());
}

function getMetaData(filePath) {

  const metaFileContents = fs.readFileSync(filePath);
  const metaContents = JSON.parse(metaFileContents)[0];

  return metaContents['MEDIA_DAG'];
}
