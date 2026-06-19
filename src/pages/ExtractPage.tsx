import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Lock, Play, FileAudio, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/FileUpload';
import { Progress } from '@/components/ui/progress';
import { User, ExtractionResponse } from '@/types';
import { extractionService } from '@/services/extraction.service';
import { validateImageFile, validateEncryptionKey } from '@/utils/validators';
import { FILE_CONSTRAINTS, API_BASE_URL } from '@/constants';
import { toast } from 'sonner';
import { formatBytes } from '@/utils/formatters';

interface ExtractPageProps {
  user: User;
}

const ExtractPage: React.FC<ExtractPageProps> = ({ user: _user }) => {
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Check backend health on mount
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
          toast.warning('Processing backend may not be running correctly');
        }
      } catch (error) {
        setBackendOnline(false);
        toast.error('Cannot connect to processing backend. Check Render deployment status.', { duration: 7000 });
        console.error('Backend health check failed:', error);
      }
    };

    checkBackend();
  }, []);

  const handleImageSelect = (file: File) => {
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    const validation = validateImageFile(file);
    console.log('Validation result:', validation);
    
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    
    setStegoImage(file);
    toast.success(`Image selected: ${file.name}`);
  };

  const handleExtract = async () => {
    if (!stegoImage) {
      toast.error('Please select a stego image');
      return;
    }

    const keyValidation = validateEncryptionKey(encryptionKey);
    if (!keyValidation.valid) {
      toast.error(keyValidation.message);
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      toast.info('Starting extraction process...');
      
      console.log('Extraction Request:', {
        fileName: stegoImage.name,
        fileSize: stegoImage.size,
        fileType: stegoImage.type,
        keyLength: encryptionKey.length,
      });
      
      const response = await extractionService.extractAudio(
        {
          stego_image: stegoImage,
          encryption_key: encryptionKey,
        },
        (uploadProgress) => {
          setProgress(uploadProgress);
          console.log('Upload progress:', uploadProgress);
        }
      );

      console.log('Extraction response:', response);
      setProgress(100);
      setResult(response);
      toast.success('Audio extracted successfully!');
    } catch (error: any) {
      console.error('Extraction Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Extraction failed. Please check your image and encryption key.';
      
      toast.error(errorMessage, { duration: 5000 });
      
      // Show more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to processing server. Please ensure the Python backend is running on port 5000.', { duration: 7000 });
      } else if (error.response?.status === 500) {
        toast.error('Server error. Check if the image was created by this tool and the encryption key is correct.', { duration: 7000 });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!result?.audio_base64) return;

    const byteCharacters = atob(result.audio_base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.audio_name || 'extracted_audio.wav';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Audio downloaded!');
  };

  const handleReset = () => {
    setStegoImage(null);
    setEncryptionKey('');
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <Download className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
          Extract Hidden Audio
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Upload a stego PNG created by this tool to recover the hidden audio
        </p>
        
        {/* Backend Status Indicator */}
        {backendOnline !== null && (
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm ${
            backendOnline 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            {backendOnline ? 'Processing Server Online' : 'Processing Server Offline'}
          </div>
        )}
      </motion.div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload Stego Image</CardTitle>
                <CardDescription>
                  Select the image containing hidden audio and provide the encryption key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label className="mb-2 block text-sm sm:text-base">Stego Image</Label>
                  <FileUpload
                    onFileSelect={handleImageSelect}
                    acceptedTypes={[...FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS]}
                    maxSize={FILE_CONSTRAINTS.MAX_IMAGE_SIZE}
                    currentFile={stegoImage}
                    onFileRemove={() => {
                      setStegoImage(null);
                      toast.info('Image removed');
                    }}
                    label="Drop stego image or click to browse"
                    icon="image"
                  />
                  {stegoImage && (
                    <div className="mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400 break-all">
                      ✓ Image loaded: {stegoImage.name} ({formatBytes(stegoImage.size)})
                    </div>
                  )}
                  
                  {/* Fallback manual input */}
                  <div className="mt-3">
                    <Label htmlFor="manual-file-input" className="text-xs text-gray-500">
                      Or use file picker:
                    </Label>
                    <input
                      id="manual-file-input"
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('Manual file selected:', file);
                          handleImageSelect(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 mt-2
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary/90
                        cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryptionKey" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Encryption Key
                  </Label>
                  <Input
                    id="encryptionKey"
                    type="password"
                    placeholder="Enter the encryption key used during embedding"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    maxLength={32}
                  />
                  <p className="text-xs text-gray-500">
                    Must match the key used during audio embedding
                  </p>
                </div>

                {processing && (
                  <div className="space-y-2">
                    <Label>Extracting...</Label>
                    <Progress value={progress} />
                    <p className="text-xs text-center text-gray-500">
                      {progress < 30 ? 'Uploading image...' : 
                       progress < 90 ? 'Decrypting and extracting...' : 
                       'Finalizing...'}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleExtract}
                  disabled={!stegoImage || !encryptionKey || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    'Extracting...'
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Extract Audio
                    </>
                  )}
                </Button>

                {/* Info Box */}
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <FileAudio className="w-4 h-4" />
                    Extraction Process
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Works with any PNG downloaded from the Embed page</li>
                    <li>• No server-side metadata required — data is in the image</li>
                    <li>• Decrypts using AES-256 with your encryption key</li>
                    <li>• Download the recovered audio file after extraction</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-4 sm:space-y-6"
        >
          {/* Success Card */}
          <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-success rounded-full mb-3 sm:mb-4"
                >
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-success mb-2 px-2">
                  Extraction Successful!
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
                  Your audio file has been successfully extracted and decrypted
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6 px-2">
                  <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">File Name</p>
                    <p className="font-semibold mt-1 text-sm sm:text-base truncate" title={result.audio_name}>
                      {result.audio_name}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">File Size</p>
                    <p className="font-semibold mt-1 text-sm sm:text-base">{formatBytes(result.audio_size)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
                  <Button onClick={handleDownloadAudio} size="lg" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Download Audio
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto">
                    Extract Another
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4 sm:mt-6">
                  Extraction completed in {result.execution_time.toFixed(2)} seconds
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio Player */}
          {result.audio_base64 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Audio Preview</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <audio
                  controls
                  className="w-full"
                  src={`data:audio/wav;base64,${result.audio_base64}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ExtractPage;
