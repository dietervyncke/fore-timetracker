import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

export const createDirectoryZipFile = async (directory, name) => {

  const zipName = directory+'/'+name+'.zip';
  const uris = await FileSystem.readDirectoryAsync(directory);

  if (! uris.length) {
    return null;
  }

  const data = await Promise.all(uris.map(async uri => {
    return await FileSystem.readAsStringAsync(directory+'/'+uri, {encoding: FileSystem.EncodingType.Base64});
  }));

  const zip = JSZip();

  for (let [key, uri] of uris.entries()) {
    zip.file(uri, data[key], {base64: true});
  }

  let zipContents = await zip.generateAsync({type:"base64"});

  await FileSystem.writeAsStringAsync(zipName, zipContents, {
    encoding: FileSystem.EncodingType.Base64
  });

  return zipName;
};