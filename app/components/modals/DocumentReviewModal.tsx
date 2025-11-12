'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  riderData: {
    riderId: number;
    name: string;
    documents?: {
      profileImage?: string;
      driversLicense?: string;
      vehicleRegistration?: string;
      insuranceCertificate?: string;
      vehiclePhotos?: string;
    };
  };
}

interface DocumentInfo {
  name: string;
  fileId: string;
  type: 'image' | 'document';
  label: string;
}

// ✅ FIXED: Use backend retrieval endpoint instead of direct Hedera access
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

export default function DocumentReviewModal({ isOpen, onClose, riderData }: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDocument(null);
      setImageError(null);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  // ✅ Prepare document list with proper typing
  const documents: DocumentInfo[] = [
    {
      name: 'profileImage',
      fileId: riderData.documents?.profileImage || '',
      type: 'image' as const,
      label: 'Profile Photo',
    },
    {
      name: 'driversLicense',
      fileId: riderData.documents?.driversLicense || '',
      type: 'document' as const,
      label: "Driver's License",
    },
    {
      name: 'vehicleRegistration',
      fileId: riderData.documents?.vehicleRegistration || '',
      type: 'document' as const,
      label: 'Vehicle Registration',
    },
    {
      name: 'insuranceCertificate',
      fileId: riderData.documents?.insuranceCertificate || '',
      type: 'document' as const,
      label: 'Insurance Certificate',
    },
    {
      name: 'vehiclePhotos',
      fileId: riderData.documents?.vehiclePhotos || '',
      type: 'image' as const,
      label: 'Vehicle Photos',
    },
  ].filter((doc) => doc.fileId && doc.fileId.trim() !== '');

  const handleDocumentSelect = (document: DocumentInfo) => {
    console.log(`📄 Selecting document: ${document.label} (${document.fileId})`);
    setSelectedDocument(document);
    setImageError(null);
    setImageLoading(true);
    setZoom(100);
    setRotation(0);
  };

  const handleImageLoad = () => {
    console.log(`✅ Document loaded successfully`);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.error(`❌ Failed to load document: ${selectedDocument?.fileId}`);
    setImageLoading(false);
    setImageError('Failed to load document. The file may be corrupted or inaccessible.');
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // ✅ FIXED: Download using backend endpoint
  const handleDownload = async (document: DocumentInfo) => {
    try {
      console.log(`💾 Downloading document: ${document.fileId}`);

      // Use backend retrieval endpoint
      const url = `${BACKEND_URL}/upload/file/${document.fileId}`;

      // Open in new tab for download
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // ✅ FIXED: Get file URL using backend endpoint
  const getFileUrl = (fileId: string): string => {
    const url = `${BACKEND_URL}/upload/file/${fileId}`;
    console.log(`🔗 Generated file URL: ${url}`);
    return url;
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Document Review - {riderData.name}</h2>
            <p className="text-sm text-gray-600">
              Rider ID: #{riderData.riderId} • {documents.length} documents available
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Document List Sidebar */}
          <div className="w-80 overflow-y-auto border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Documents</h3>

              {documents.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No documents available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.name}
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        selectedDocument?.name === document.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleDocumentSelect(document)}
                    >
                      <div className="flex items-center gap-3">
                        {document.type === 'image' ? (
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-800">{document.label}</p>
                          <p className="truncate text-xs text-gray-500">
                            File ID: {document.fileId}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(document);
                          }}
                          className="rounded p-1 transition-colors hover:bg-gray-200"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 bg-gray-100">
            {!selectedDocument ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Eye className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-600">
                    Select a document to view
                  </h3>
                  <p className="text-gray-500">
                    Choose a document from the sidebar to preview it here
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                {/* Viewer Controls */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{selectedDocument.label}</h4>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {selectedDocument.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="rounded p-2 transition-colors hover:bg-gray-100"
                      disabled={zoom <= 50}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="min-w-[60px] text-center text-sm text-gray-600">{zoom}%</span>
                    <button
                      onClick={handleZoomIn}
                      className="rounded p-2 transition-colors hover:bg-gray-100"
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <div className="mx-2 h-6 w-px bg-gray-300" />
                    <button
                      onClick={handleRotate}
                      className="rounded p-2 transition-colors hover:bg-gray-100"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedDocument)}
                      className="rounded p-2 transition-colors hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 overflow-auto p-4">
                  <div className="flex min-h-full items-center justify-center">
                    {imageLoading && (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="text-gray-600">Loading document...</span>
                      </div>
                    )}

                    {imageError && (
                      <div className="text-center">
                        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
                        <p className="mb-2 font-medium text-red-600">Failed to load document</p>
                        <p className="text-sm text-gray-500">{imageError}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          File ID: {selectedDocument.fileId}
                        </p>
                        <button
                          onClick={() => handleDocumentSelect(selectedDocument)}
                          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {!imageLoading && !imageError && (
                      <img
                        src={getFileUrl(selectedDocument.fileId)}
                        alt={selectedDocument.label}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transition: 'transform 0.3s ease',
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
