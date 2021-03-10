import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

export const createDirectoryZipFile = async (directory, name) => {

  const uris = await FileSystem.readDirectoryAsync(directory);

  const data = await Promise.all(uris.map(async uri => {
    return await FileSystem.readAsStringAsync(directory+'/'+uri);
  }));

  const zip = JSZip();

  for (let [key, uri] of uris.entries()) {

    console.log(uri);

    if (uri.endsWith('jpeg')) {

      const base64 = await data[key].async('base64');
      const b64uri = `data:image/jpeg;base64,${base64}`;
      zip.file(uri, b64uri, {base64: true});

    } else {
      zip.file(uri, data[key]);
    }
  }

  return;

  let zipContents = await zip.generateAsync({type:"base64"});

  await FileSystem.writeAsStringAsync(directory+'/'+name+'.zip', zipContents, {
    encoding: FileSystem.EncodingType.Base64
  });
};