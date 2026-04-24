import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { InteractionManager } from "react-native";

export type PickedFile = {
  name: string;
  uri: string;
};

export async function pickJsonFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return { name: asset.name, uri: asset.uri };
}

/**
 * Reads a JSON file from disk and parses it. JSON.parse is deferred until
 * after the current interaction frame so we don't block any ongoing UI
 * animations on large exports.
 */
export async function readJsonFileAsync<T = unknown>(uri: string): Promise<T> {
  const file = new File(uri);
  const text = await file.text();

  return new Promise<T>((resolve, reject) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        resolve(JSON.parse(text) as T);
      } catch (err) {
        reject(err);
      }
    });
  });
}
