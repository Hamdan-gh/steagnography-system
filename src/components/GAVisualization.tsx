import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Dna, Zap } from 'lucide-react';
import { GAResults } from '@/types';

interface GAVisualizationProps {
  results: GAResults;
}

export const GAVisualization: React.FC<GAVisualizationProps> = ({ results }) => {
  const isFastMode = results.mode === 'fast_lsb';
  const chartData = results.convergence_data.map((fitness, index) => ({
    generation: index + 1,
    fitness: fitness,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFastMode ? (
              <>
                <Zap className="w-5 h-5 text-accent" />
                Fast LSB Embedding
              </>
            ) : (
              <>
                <Dna className="w-5 h-5 text-accent" />
                Genetic Algorithm Convergence
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
                <p className="text-2xl font-bold text-primary">{results.best_fitness.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isFastMode ? 'Method' : 'Generations'}
                </p>
                <p className="text-2xl font-bold text-accent">
                  {isFastMode ? 'LSB' : results.generations}
                </p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isFastMode ? 'Visual Change' : 'Population'}
                </p>
                <p className="text-2xl font-bold text-success">
                  {isFastMode ? 'Minimal' : results.population_size}
                </p>
              </div>
            </div>

            {!isFastMode && chartData.length > 1 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="generation"
                      label={{ value: 'Generation', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis label={{ value: 'Fitness', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fitness"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                      name="Fitness Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">
                {isFastMode ? 'Embedding Details:' : 'Optimization Details:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                {isFastMode ? (
                  <>
                    <li>Used vectorized LSB steganography for instant processing</li>
                    <li>Only the least significant bit of each pixel channel was modified</li>
                    <li>Image appearance is preserved — changes are invisible to the eye</li>
                    <li>Audio can be extracted from the downloaded PNG on any device</li>
                  </>
                ) : (
                  <>
                    <li>Optimized {results.optimized_positions.length} pixel positions</li>
                    <li>Achieved fitness score of {results.best_fitness.toFixed(4)}</li>
                    <li>Converged in {results.generations} generations</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
