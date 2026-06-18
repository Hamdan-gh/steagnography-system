import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, FileAudio, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/utils/formatters';
import { Button } from './ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  currentFile?: File | null;
  onFileRemove: () => void;
  label: string;
  icon?: 'audio' | 'image';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes,
  maxSize,
  currentFile,
  onFileRemove,
  label,
  icon = 'image',
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    onDropRejected: (rejections) => {
      console.log('File rejections:', rejections);
      rejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            console.error(`File too large: ${rejection.file.name}`);
          } else if (error.code === 'file-invalid-type') {
            console.error(`Invalid file type: ${rejection.file.type}`);
          } else {
            console.error(`File rejection: ${error.code} - ${error.message}`);
          }
        });
      });
    },
  });

  // Log file rejections if any
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      console.log('Files rejected by dropzone:', fileRejections);
    }
  }, [fileRejections]);

  const Icon = icon === 'audio' ? FileAudio : ImageIcon;

  return (
    <div className="w-full">
      {!currentFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary'
          )}
        >
          <input {...getInputProps()} />
          <Icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop file here' : label}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse (max {formatBytes(maxSize)})
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supported formats: {acceptedTypes.map(t => t.split('/')[1]).join(', ')}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-primary rounded-lg p-4 bg-primary/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{currentFile.name}</p>
                <p className="text-sm text-gray-500">{formatBytes(currentFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFileRemove}
              className="text-danger hover:text-danger/80"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
