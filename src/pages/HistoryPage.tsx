import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Download, Eye, Calendar, TrendingUp, RefreshCw, FileAudio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, StegoImage, ExtractionLog } from '@/types';
import { databaseService } from '@/services/database.service';
import { formatDateTime, formatBytes } from '@/utils/formatters';
import { resolveMediaUrl } from '@/utils/urls';
import { toast } from 'sonner';

interface HistoryPageProps {
  user: User;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
  const [embedHistory, setEmbedHistory] = useState<StegoImage[]>([]);
  const [extractHistory, setExtractHistory] = useState<ExtractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'embeddings' | 'extractions'>('embeddings');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { embeddings, extractions, errors } = await databaseService.getOperationHistory(
        user.id,
        50
      );

      setEmbedHistory(embeddings);
      setExtractHistory(extractions);

      if (errors.length > 0) {
        errors.forEach((msg) => toast.error(msg));
      }
    } catch (error) {
      const maybeError = error as { code?: string };
      if (maybeError?.code === '42P17') {
        toast.error('Database policy error. Run supabase_rls_fix.sql in Supabase SQL Editor.');
      } else {
        toast.error('Failed to load history');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'success';
      case 'processing':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const openDownload = (url: string | null | undefined, label: string) => {
    const resolved = resolveMediaUrl(url);
    if (resolved) {
      window.open(resolved, '_blank');
      toast.success(`Opening ${label}`);
    } else {
      toast.error('Download URL not available');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const activeList = activeTab === 'embeddings' ? embedHistory : extractHistory;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="w-8 h-8 text-primary" />
              Operation History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Embeddings and extractions loaded from your database
            </p>
          </div>
          <Button variant="outline" onClick={fetchHistory} className="shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Embeddings</p>
                <p className="text-2xl font-bold mt-1">{embedHistory.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Extractions</p>
                <p className="text-2xl font-bold mt-1">{extractHistory.length}</p>
              </div>
              <FileAudio className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {embedHistory.filter((h) => h.status === 'completed').length +
                    extractHistory.filter((h) => h.status === 'success').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg PSNR</p>
                <p className="text-2xl font-bold mt-1 text-accent">
                  {embedHistory.length > 0
                    ? (embedHistory.reduce((acc, h) => acc + (h.psnr || 0), 0) / embedHistory.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('embeddings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'embeddings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Embeddings ({embedHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('extractions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'extractions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Extractions ({extractHistory.length})
        </button>
      </div>

      {activeList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No {activeTab === 'embeddings' ? 'Embeddings' : 'Extractions'} Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'embeddings'
                ? 'Embed audio in an image — it will appear here automatically.'
                : 'Extract audio from a stego image — it will appear here automatically.'}
            </p>
            <Button onClick={() => (window.location.href = activeTab === 'embeddings' ? '/embed' : '/extract')}>
              {activeTab === 'embeddings' ? 'Start Embedding' : 'Start Extracting'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeTab === 'embeddings'
            ? embedHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(item.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {item.cover_image_name} + {item.audio_file_name}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">PSNR</p>
                              <p className="font-semibold">{(item.psnr ?? 0).toFixed(2)} dB</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">SSIM</p>
                              <p className="font-semibold">{(item.ssim ?? 0).toFixed(4)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
                              <p className="font-semibold">{formatBytes(item.capacity_used ?? 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                              <p className="font-semibold">{(item.execution_time ?? 0).toFixed(2)}s</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => openDownload(item.stego_image_url, 'stego image')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : extractHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(item.created_at)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Stego Image</p>
                              <p className="font-semibold break-all">{item.stego_image_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Audio File</p>
                              <p className="font-semibold break-all">{item.audio_name || 'extracted_audio.wav'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Extracted Size</p>
                              <p className="font-semibold">{formatBytes(item.extracted_audio_size || 0)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Extraction time: {(item.extraction_time ?? item.execution_time ?? 0).toFixed(2)}s
                          </p>
                          {item.error_message && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{item.error_message}</p>
                          )}
                        </div>
                        {item.status === 'success' && item.audio_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => openDownload(item.audio_url, 'extracted audio')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download Audio
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">
                            {item.status === 'failed' ? 'Failed' : 'No file'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
