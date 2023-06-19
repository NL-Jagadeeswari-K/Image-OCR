import "./App.css";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import uploadFileToBlob, { getBlobsInContainer } from "./azure-blob";
import {
  uploadForm,
  isConfigured as FileRecognitionIsConfigured,
} from "./form-recognizer";

function App() {
  const [fileSelected, setFileSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);
  const [fileUploaded, setFileUploaded] = useState("");
  const [blobList, setBlobList] = useState();

  // UI/form management
  const [inputKey, setInputKey] = useState(Math.random().toString(36));
  // THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
  useEffect(() => {
    getBlobsInContainer().then((list) => {
      // prepare UI for results
      setBlobList(list);
    });
  }, [fileUploaded]);

  const uploadImage = async (e) => {
    await uploadFileToBlob(image);
    setImage(null);
    setFileUploaded(image.name);
    setLoading(false);
    setProcessing(true);
    setAnalysis(null);
    setInputKey(Math.random().toString(36));

    const file = blobList.find((b) => b.name === image.name);

    uploadForm(file.url || null).then((item) => {
      setAnalysis(item);
      setFileSelected("");
      setProcessing(false);
    });
  };

  const DisplayResults = () => {
    return (
      <div>
        <h2>Computer Vision Analysis</h2>
        <div>
          <img
            src={analysis.URL}
            height="200"
            // border="1"
            alt={
              analysis.description &&
              analysis.description.captions &&
              analysis.description.captions[0].text
                ? analysis.description.captions[0].text
                : "can't find caption"
            }
          />
        </div>
        {/* {JSON.stringify(analysis.result)} */}
        {/* {console.log(analysis.result)} */}
        <Table striped="columns">
          <tbody>
            {analysis?.result?.map((text) => {
              return text.map((t, i) => {
                return (
                  <tr key={i}>
                    {i % 2 === 0 && <td className="evenc">{t.text}</td>}
                    {i % 2 === 1 && <td className="odd">{t.text}</td>}
                  </tr>
                );
              });
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  const Analyze = () => {
    return (
      <div>
        <h1 className="text-data">OCR Image Analysis</h1>
        {!processing && (
          <div>
            <div>
              <div className="mb-3">
                {!fileSelected ? (
                  <input
                    className="form-control"
                    type="file"
                    id="formFile"
                    placeholder="upload an image"
                    onChange={(e) => {
                      setImage(e.target.files[0]);
                      setDisabled(false);
                      setFileSelected(e.target.files[0].name);
                    }}
                    style={{ width: "500px", marginTop: "50px" }}
                  />
                ) : (
                  <div style={{ marginTop: "20px" }}>
                    <span>
                      <p>{fileSelected}</p>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setFileSelected(null)}
                        style={{ marginLeft: "300px", marginTop: "-75px" }}
                      >
                        X
                      </button>
                    </span>
                  </div>
                )}
              </div>
              {loading ? <h3>Loading...</h3> : <></>}
              <br />
              <br />
              <button
                className="btn btn-success"
                onClick={uploadImage}
                disabled={isDisabled}
              >
                Analyze
              </button>
            </div>
          </div>
        )}
        {processing && <h3>Processing...</h3>}
        <hr />
        {analysis && DisplayResults()}
        <br />
      </div>
    );
  };

  const CantAnalyze = () => {
    return (
      <div>
        Key and/or endpoint not configured in
        ./azure-cognitiveservices-computervision.js
      </div>
    );
  };

  function Render() {
    const ready = FileRecognitionIsConfigured();
    if (ready) {
      return <Analyze />;
    }
    return <CantAnalyze />;
  }

  return <div>{Render()}</div>;
}

export default App;
