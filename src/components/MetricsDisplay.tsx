import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Eye, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { QualityMetrics } from '@/types';
import { QUALITY_THRESHOLDS } from '@/constants';
import { formatNumber, formatPercentage } from '@/utils/formatters';

interface MetricsDisplayProps {
  metrics: QualityMetrics;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const getQualityBadge = (psnr: number) => {
    if (psnr >= QUALITY_THRESHOLDS.PSNR_EXCELLENT) {
      return <Badge variant="success">Excellent</Badge>;
    } else if (psnr >= QUALITY_THRESHOLDS.PSNR_GOOD) {
      return <Badge variant="default">Good</Badge>;
    } else if (psnr >= QUALITY_THRESHOLDS.PSNR_ACCEPTABLE) {
      return <Badge variant="secondary">Acceptable</Badge>;
    }
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getSSIMBadge = (ssim: number) => {
    if (ssim >= QUALITY_THRESHOLDS.SSIM_EXCELLENT) {
      return <Badge variant="success">Excellent</Badge>;
    } else if (ssim >= QUALITY_THRESHOLDS.SSIM_GOOD) {
      return <Badge variant="default">Good</Badge>;
    } else if (ssim >= QUALITY_THRESHOLDS.SSIM_ACCEPTABLE) {
      return <Badge variant="secondary">Acceptable</Badge>;
    }
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PSNR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">PSNR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatNumber(metrics.psnr)} dB</span>
                {getQualityBadge(metrics.psnr)}
              </div>
            </div>
            <Progress value={Math.min(metrics.psnr, 50)} max={50} />
          </div>

          {/* MSE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="font-medium">MSE</span>
              </div>
              <span className="text-2xl font-bold">{formatNumber(metrics.mse, 4)}</span>
            </div>
            <Progress value={Math.max(0, 100 - metrics.mse * 10)} max={100} />
            <p className="text-xs text-gray-500">Lower is better</p>
          </div>

          {/* SSIM */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-success" />
                <span className="font-medium">SSIM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatNumber(metrics.ssim, 4)}</span>
                {getSSIMBadge(metrics.ssim)}
              </div>
            </div>
            <Progress value={metrics.ssim * 100} max={100} />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-warning" />
                <span className="font-medium">Capacity Usage</span>
              </div>
              <span className="text-lg font-bold">
                {formatPercentage(metrics.capacity_used, metrics.capacity_total)}
              </span>
            </div>
            <Progress value={metrics.capacity_used} max={metrics.capacity_total} />
            <p className="text-xs text-gray-500">
              {metrics.capacity_used} / {metrics.capacity_total} bytes used
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
