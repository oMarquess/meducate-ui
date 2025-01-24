"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormState } from "./FormContext";

export function FileForm() {
    const { onHandleNext, onHandleBack, setFormData } = useFormState();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null); // State for error message

    // Handle file drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFormData((prevFormData) => ({ ...prevFormData, files: acceptedFiles }));
        setUploadedFiles(acceptedFiles);
        setUploadProgress(0);
        setError(null); // Clear error when files are uploaded

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                const newProgress = prevProgress + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, 200);
    }, [setFormData]);

    // Handle file removal
    const handleRemoveFile = (file: File) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            files: prevFormData.files.filter((f) => f !== file),
        }));
        setUploadedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    };

    // Handle next button click
    const handleNext = () => {
        if (uploadedFiles.length === 0) {
            setError("Please upload at least one file before proceeding."); // Set error message
        } else {
            setError(null); // Clear error
            onHandleNext(); // Proceed to the next step
        }
    };

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
        },
    });

    return (
        <form className="space-y-9">
            <div className="flex flex-col gap-4">
                <label htmlFor="files" className="funnel-display-light block font-medium text-gray-800">
                    Upload Files
                </label>
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-md p-4 ${
                        isDragActive ? "border-blue-500" : "border-gray-400"
                    }`}
                >
                    <input {...getInputProps()} required />
                    {isDragActive ? (
                        <p className="text-center text-gray-600">Drop the files here...</p>
                    ) : (
                        <p className="text-center text-gray-600">
                            Drag & drop files here, or click to select files
                        </p> 
                    )}
                </div>
                {uploadedFiles.length > 0 ? (
                    <div>
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        <ul className="mt-2 space-y-1">
                            {uploadedFiles.map((file) => (
                                <li key={file.name} className="flex items-center justify-between text-sm text-gray-600">
                                    <span>{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(file)}
                                        className="text-red-500 hover:text-red-700 focus:outline-none"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{uploadProgress}% uploaded</p>
                        </div>
                    </div>
                ) : (
                    // Show error message if no files are uploaded
                    error && <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onHandleBack}
                    className="h-11 px-6 bg-black text-white rounded-md"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleNext} // Use the custom handleNext function
                    disabled={uploadedFiles.length === 0} // Disable if no files are uploaded
                    className={`h-11 px-6 bg-black text-white rounded-md ${
                        uploadedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    Next
                </button>
            </div>
        </form>
    );
}