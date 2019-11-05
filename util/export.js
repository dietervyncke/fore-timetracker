import * as FileSystem from "expo-file-system";
import { ExportToCsv } from "export-to-csv";

async function convertDataToCsv(file, data, headers = []) {
    let fileName = file;
    let csvContent = exportCsvFile(data, headers);
    const fileUri = FileSystem.documentDirectory+fileName;

    return writeFile(csvContent, fileUri).then(() => {
        return getFileInfo(fileUri).then(file => {
            return file;
        });
    });
}

async function getFileInfo(fileUri) {
    return await FileSystem.getInfoAsync(fileUri);
}

async function writeFile(content, fileUri) {
    return await FileSystem.writeAsStringAsync(
        fileUri,
        content
    );
}

function exportCsvFile(objects, headers) {
    const options = {
        fieldSeparator: '|',
        quoteStrings: '',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: false,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: false,
        headers: headers
    };
    const csvExporter = new ExportToCsv(options);
    return csvExporter.generateCsv(objects, true);
}

export { convertDataToCsv };