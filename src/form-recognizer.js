import {
  AzureKeyCredential,
  DocumentAnalysisClient,
  DocumentModelAdministrationClient,
  DocumentModelBuildMode,
} from "@azure/ai-form-recognizer";

import { v4 as uuidv4 } from "uuid";
const GUID = uuidv4();

const endpoint = process.env.REACT_APP_AZURE_FORM_RECOGNIZER_ENDPOINT;
const key = process.env.REACT_APP_AZURE_COMPUTER_VISION_KEY;
const containerSasUrl =process.env.REACT_APP_AZURE_CONTAINER_SAS_URL;

const credential = new AzureKeyCredential(key);
const client = new DocumentAnalysisClient(endpoint, credential);

export const isConfigured = () => {
  const result =
    key && endpoint && key.length > 0 && endpoint.length > 0 ? true : false;
  return result;
};

const createModel = async () => {
  const client = new DocumentModelAdministrationClient(
    endpoint,
    new AzureKeyCredential(key)
  );
  console.log("client", GUID);
  const poller = await client.beginBuildDocumentModel(GUID, containerSasUrl, DocumentModelBuildMode.Template);
  const model = await poller.pollUntilDone();
  console.log(model);

  return model;
};

export async function uploadForm(url) {
  const model = createModel();
  console.log("Custom model ID:", model.modelId);

  const poller = await client.beginAnalyzeDocumentFromUrl(model.modelId, url);
  // console.log("Recognized forms:", forms);

  const { pages, tables, styles, keyValuePairs, entities, documents } =
    await poller.pollUntilDone();
  console.log(
    "Recognized pages:",
    pages,
    tables,
    styles,
    keyValuePairs,
    entities,
    documents
  );
}
