import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Lock, Play, Download, AlertCircle, CheckCircle, ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/FileUpload';
import { Progress } from '@/components/ui/progress';
import { MetricsDisplay } from '@/components/MetricsDisplay';
import { GAVisualization } from '@/components/GAVisualization';
import { User, EmbeddingResponse } from '@/types';
import { embeddingService } from '@/services/embedding.service';
import { apiService } from '@/services/api';
import { validateImageFile, validateAudioFile, validateEncryptionKey } from '@/utils/validators';
import { FILE_CONSTRAINTS } from '@/constants';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface EmbedPageProps {
  user: User;
}

const EmbedPage: React.FC<EmbedPageProps> = ({ user: _user }) => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<EmbeddingResponse | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiService.checkHealth();
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
        toast.error('Backend not responding', {
          description: 'Please ensure the Python engine is running on port 5000'
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageSelect = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    setCoverImage(file);
  };

  const handleAudioSelect = (file: File) => {
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    setAudioFile(file);
  };

  const handleEmbed = async () => {
    if (!coverImage || !audioFile) {
      toast.error('Please select both cover image and audio file');
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

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      toast.info('Embedding audio into image...');

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 5 : prev));
      }, 300);

      const response = await embeddingService.embedAudio(
        {
          cover_image: coverImage,
          audio_file: audioFile,
          encryption_key: encryptionKey,
        },
        (uploadProgress) => {
          setProgress(uploadProgress * 0.3);
        }
      );

      setProgress(100);
      setResult(response);
      toast.success('Audio embedded successfully!', {
        description: `Completed in ${response.execution_time.toFixed(2)} seconds. Download your stego image below.`
      });
    } catch (error: any) {
      console.error('Embedding error:', error);
      let errorMessage = error.response?.data?.error || error.message || 'Embedding failed';
      if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
        errorMessage = 'Processing took too long. Try using a smaller audio file or a larger image.';
      }
      toast.error('Embedding Failed', { description: errorMessage, duration: 7000 });
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProcessing(false);
    }
  };

  const downloadStegoImage = () => {
    if (!result?.stego_image_base64) return;

    const byteCharacters = atob(result.stego_image_base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stego_${coverImage?.name?.replace(/\.[^.]+$/, '') || 'image'}.png`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Stego image downloaded! Use the Extract page to recover the audio.');
  };

  const handleReset = () => {
    setCoverImage(null);
    setAudioFile(null);
    setEncryptionKey('');
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Upload className="w-8 h-8 text-primary" />
              Embed Audio in Image
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Hide audio inside an image in seconds — the picture looks identical to the original
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            {backendHealthy === null ? (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Checking...</span>
              </>
            ) : backendHealthy ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Backend Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Backend Offline</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Select cover image and audio file to hide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Cover Image</Label>
                  <FileUpload
                    onFileSelect={handleImageSelect}
                    acceptedTypes={[...FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS]}
                    maxSize={FILE_CONSTRAINTS.MAX_IMAGE_SIZE}
                    currentFile={coverImage}
                    onFileRemove={() => setCoverImage(null)}
                    label="Drop cover image or click to browse"
                    icon="image"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Audio File</Label>
                  <FileUpload
                    onFileSelect={handleAudioSelect}
                    acceptedTypes={[...FILE_CONSTRAINTS.SUPPORTED_AUDIO_FORMATS]}
                    maxSize={FILE_CONSTRAINTS.MAX_AUDIO_SIZE}
                    currentFile={audioFile}
                    onFileRemove={() => setAudioFile(null)}
                    label="Drop audio file or click to browse"
                    icon="audio"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Encryption
                </CardTitle>
                <CardDescription>Your audio is encrypted with AES-256 before embedding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="encryptionKey" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Encryption Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="encryptionKey"
                      type="text"
                      placeholder="Enter 16-32 character key"
                      value={encryptionKey}
                      onChange={(e) => setEncryptionKey(e.target.value)}
                      maxLength={32}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const key = Array.from({ length: 24 }, () =>
                          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
                            Math.floor(Math.random() * 62)
                          )
                        ).join('');
                        setEncryptionKey(key);
                        toast.success('Key generated! Save it — you need it to extract the audio.');
                      }}
                      className="whitespace-nowrap"
                    >
                      Auto Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Keep this key safe. You will need it on the Extract page to recover your audio.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Fast & invisible embedding</p>
                  <p className="text-xs">
                    Processing typically completes in a few seconds. The cover image appearance is preserved —
                    only invisible LSB changes are made. Save the downloaded PNG to extract audio later.
                  </p>
                </div>

                {processing && (
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label className="text-sm font-semibold">Processing...</Label>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-gray-700 dark:text-gray-300 font-medium">
                      {progress < 30 ? 'Uploading files...' : 'Encrypting and embedding audio...'}
                    </p>
                    <p className="text-xs text-center text-gray-500 font-mono">{progress.toFixed(0)}%</p>
                  </div>
                )}

                <Button
                  onClick={handleEmbed}
                  disabled={!coverImage || !audioFile || !encryptionKey || processing || !backendHealthy}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    'Embedding...'
                  ) : !backendHealthy ? (
                    'Backend Offline'
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Embed Audio
                    </>
                  )}
                </Button>

                {!backendHealthy && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-center">
                    Start the Python backend: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">python app.py</code>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-success mb-1">Embedding Successful!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Audio is hidden inside the image. Download the PNG below — it looks identical to your original.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Completed in {result.execution_time.toFixed(2)}s · PSNR {result.metrics.psnr.toFixed(1)} dB ·
                      SSIM {result.metrics.ssim.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={downloadStegoImage} size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Stego Image
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg">
                      New Embedding
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsDisplay metrics={result.metrics} />
            <GAVisualization results={result.ga_results} />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Stego Image Preview
                </CardTitle>
                <CardDescription>
                  Visually identical to the original — audio is embedded invisibly in the pixel data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={`data:image/png;base64,${result.stego_image_base64}`}
                  alt="Stego Image"
                  className="w-full max-h-96 object-contain rounded-lg shadow-lg mx-auto"
                />
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 text-center">
                  To recover the audio later, go to{' '}
                  <Link to={ROUTES.EXTRACT} className="text-primary font-medium hover:underline">
                    Extract Audio
                  </Link>{' '}
                  and upload this PNG with your encryption key.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmbedPage;
