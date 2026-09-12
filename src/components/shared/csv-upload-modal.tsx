/**
 * 📊 CSV Upload Modal Component
 *
 * Reusable modal for uploading CSV/XML files with preview
 * Shows column preview in a table before import
 */

'use client';

import { AlertCircle, Download, FileText, HelpCircle, Upload, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface CsvUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: File) => Promise<void>;
  title?: string;
  description?: string;
  acceptedFormats?: string[];
}

export function CsvUploadModal({
  open,
  onOpenChange,
  onUpload,
  title = 'Upload CSV File',
  description = 'Upload a CSV or XML file to import data. Preview will be shown before confirmation.',
  acceptedFormats = ['.csv', '.xml'],
}: CsvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<unknown[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  // Process file (extracted for reuse)
  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.some((format) => format.includes(fileExtension || ''))) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: `Please upload a ${acceptedFormats.join(' or ')} file.`,
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // Read and parse CSV
      const text = await selectedFile.text();
      const rows = text.split('\n').filter((row) => row.trim());

      if (rows.length === 0) {
        throw new Error('File is empty');
      }

      // Parse headers
      const headers = rows[0]?.split(',').map((h) => h.trim()) || [];
      setColumns(headers);

      // Parse data (show first 10 rows for preview)
      const data = rows.slice(1, 11).map((row) => {
        const values = row.split(',').map((v) => v.trim());
        const obj: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      setPreviewData(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error parsing file',
        description: error instanceof Error ? error.message : 'Failed to read file',
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection from input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  // Handle download sample CSV
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample-product.csv';
    link.download = 'sample-product.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download started',
      description: 'Sample CSV file has been downloaded.',
    });
  };

  // Handle upload confirmation
  const handleUpload = async () => {
    if (!file || previewData.length === 0) return;

    setIsUploading(true);

    try {
      // Read full file
      // const text = await file.text();
      // const rows = text.split('\n').filter((row) => row.trim());
      // const headers = rows[0]?.split(',').map((h) => h.trim()) || [];

      // Parse all data
      // const allData = rows.slice(1).map((row) => {
      //   const values = row.split(',').map((v) => v.trim());
      //   const obj: Record<string, unknown> = {};
      //   headers.forEach((header, index) => {
      //     obj[header] = values[index] || '';
      //   });
      //   return obj;
      // });

      // Call parent upload handler
      await onUpload(file as File);

      // Reset and close
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.log(error)
    } finally {
      setIsUploading(false);
    }
  };

  // Reset modal state
  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setIsProcessing(false);
    setIsUploading(false);
  };

  // Close and reset
  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <>
      {/* Instructions Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSV Import Instructions</DialogTitle>
            <DialogDescription>
              Follow this structure when preparing your CSV file for shoe data import.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Your CSV file must contain the following columns in this exact order:
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-3">Required Columns:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                <div><strong>category</strong> (String) - Category name</div>
                <div><strong>brand</strong> (String) - Brand name</div>
                <div><strong>model</strong> (String) - Shoe model name</div>
                <div><strong>price</strong> (Float) - Price in USD</div>
                <div><strong>subCategory/usages/usage</strong> (String, optional) - Sub-category</div>
                <div><strong>stability</strong> (String, optional) - Stability type</div>
                <div><strong>cushion</strong> (String, optional) - Cushion level</div>
                <div><strong>fit</strong> (String, optional) - Fit type</div>
                <div><strong>heelStack</strong> (Float, optional) - Heel stack height (mm)</div>
                <div><strong>foreFootStack</strong> (Float, optional) - Forefoot stack height (mm)</div>
                <div><strong>midsoleDrop</strong> (Float, optional) - Midsole drop (mm)</div>
                <div><strong>weight</strong> (Float, optional) - Weight (oz)</div>
                <div><strong>plate</strong> (String, optional) - Plate type</div>
                <div><strong>plateDescription</strong> (String, optional) - Plate description</div>
                <div><strong>description</strong> (String, optional) - Shoe description</div>
                <div><strong>images</strong> (String) - Comma-separated image URLs</div>
                <div><strong>cardImage</strong> (String, optional) - Main card image URL</div>
                <div><strong>viewLink</strong> (String, optional) - External link</div>
                <div><strong>note</strong> (String, optional) - Additional notes</div>
                <div><strong>foamType</strong> (String, optional) - Foam type</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                  <li>All columns must be present even if empty</li>
                  <li>Use comma-separated values for multiple images</li>
                  <li>Price should be a number (e.g., 129.99)</li>
                  <li>Measurements should be numbers (e.g., 280 for weight)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowInstructions(false)}>
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Upload Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Instructions and Download */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <button
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                Follow my instructions
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sample
              </Button>
            </div>
            {/* File Upload Area */}
            {!file ? (
              <label
                htmlFor="csv-upload"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-muted-foreground/25 bg-muted/50 hover:bg-muted'
                  }`}
              >
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center pointer-events-none">
                  <Upload className={`h-10 w-10 mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acceptedFormats.join(' or ').toUpperCase()} files only
                  </p>
                </div>
                <input
                  id="csv-upload"
                  type="file"
                  className="hidden"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </label>
            ) : (
              /* File Info & Preview */
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#8B1538]" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isProcessing || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Processing State */}
                {isProcessing && (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-muted-foreground">Processing file...</span>
                  </div>
                )}

                {/* Preview Table */}
                {!isProcessing && previewData.length > 0 && (
                  <div className="space-y-3 sm:max-w-[750px] overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Data Preview</h4>
                        <p className="text-sm text-muted-foreground">
                          Showing first 10 rows of {previewData.length}+ records
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {columns.length} columns
                      </Badge>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-[300px] overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {columns.map((col) => (
                                <TableHead key={col} className="whitespace-nowrap">
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.map((row, index) => (
                              <TableRow key={index}>
                                {columns.map((col) => (
                                  <TableCell key={col} className="whitespace-nowrap">
                                    {String((row as Record<string, unknown>)[col] || '-')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Warning Message */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Review before importing</p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          Make sure all columns match your expected format. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing || isUploading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {file && previewData.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing || isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    'Confirm Import'
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
