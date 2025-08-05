"use client";
import { useState, DragEvent, ChangeEvent } from "react";
import Image from "next/image";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    label: string;
    confidence: number;
  } | null>(null);

  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

  const isValidFile = (file: File): boolean => {
    const fileSizeMB = file.size / (1024 * 1024);
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setErrorMessage("Invalid file type. Only JPG or PNG images are allowed.");
      return false;
    }

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(
        `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an image file");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysisResult({
        label: data.result.label,
        confidence: data.result.confidence,
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Upload an Image</h1>

      {!selectedFile && (
        <div className="flex items-center justify-center w-1/2 mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={() => setIsDragging(true)}
            className={`flex flex-col items-center justify-center w-full h-64 border-2 ${
              isDragging
                ? "border-blue-400 bg-blue-100"
                : "border-gray-300 bg-gray-50"
            } border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors`}
          >
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  SVG, PNG or JPG (MAX. 2MB)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="image/jpeg, image/png, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}

      {previewUrl && (
        <div className="flex flex-col items-center mt-4">
          <Image
            src={previewUrl}
            alt="Preview"
            height={200}
            width={300}
            className="border rounded shadow mb-2 object-contain"
          />

          {!analysisResult && (
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="text-sm border-black bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg mt-3"
            >
              Remove Image
            </button>
          )}
        </div>
      )}

      {previewUrl && !analysisResult && (
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      )}

      {analysisResult && (
        <div className="mt-4 p-4 border rounded shadow bg-white text-center">
          <h2 className="text-lg font-semibold">Prediction Result</h2>
          <p className="mt-2">
            <strong>Label:</strong> {analysisResult.label}
          </p>
          <p>
            <strong>Confidence:</strong> {analysisResult.confidence.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
