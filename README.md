# KinderGarden-Photos
Quick and dirty scripts (nodejs) to download photos of KinderGarden daycare center, including metadata.

## Downloading

Use the script in `/src/kg-download-data.js` to download an album of photos with their metadata (separate). To do so, you'll need to edit the script and provide the year and month, as well as sessiondata (e.g. copied from a browser session). You might need to update the other request headers as well. You'll also need to create a folder named 'KinderGarden'.

## Fixing Metadata

Use the script in `/src/kg-merge-metadata.js` to merge the date info in the metadata files into the exifdata of the photos. This script should be used after successfully running the download script, described above. And before running this merge script, you should edit it and provide an albumRange.
