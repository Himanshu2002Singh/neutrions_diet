import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, File } from 'lucide-react';
import { uploadDietFile } from '../services/api';

interface DietUploadModalProps {
  userId: number;
  userName: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

function DietUploadModal({ userId, userName, onClose, onUploadComplete }: DietUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed. Please select a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await uploadDietFile(userId, selectedFile, description);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onUploadComplete();
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to upload diet file. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload diet file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Upload Diet Plan</h2>
              <p className="text-sm text-gray-500">Upload PDF for {userName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">The diet plan has been uploaded successfully.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF File
                </label>
                
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <File className="text-green-600" size={32} />
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        <span>File selected and ready to upload</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                            Click to upload
                          </span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">PDF only (max 10MB)</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={!!selectedFile || uploading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this diet plan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  disabled={uploading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {!success && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:bg-green-400 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Diet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DietUploadModal;

