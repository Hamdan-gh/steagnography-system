import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, TrendingUp, Eye, FileAudio, Image as ImageIcon, CheckCircle, Github, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WelcomePage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'AES-256 Encryption',
      description: 'Military-grade encryption ensures your audio data remains completely secure',
      color: 'text-primary',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: Zap,
      title: 'GA Optimization',
      description: 'Advanced genetic algorithms find optimal embedding positions for maximum imperceptibility',
      color: 'text-accent',
      gradient: 'from-accent/20 to-accent/5',
    },
    {
      icon: Eye,
      title: 'Invisible Hiding',
      description: 'PSNR > 40dB ensures changes are completely invisible to the human eye',
      color: 'text-success',
      gradient: 'from-success/20 to-success/5',
    },
    {
      icon: TrendingUp,
      title: 'Quality Metrics',
      description: 'Real-time PSNR, MSE, and SSIM evaluation provides quality assurance',
      color: 'text-warning',
      gradient: 'from-warning/20 to-warning/5',
    },
  ];

  const useCases = [
    {
      icon: FileAudio,
      title: 'Secure Communication',
      description: 'Send sensitive audio messages hidden in ordinary images'
    },
    {
      icon: Lock,
      title: 'Copyright Protection',
      description: 'Embed watermarks and ownership information'
    },
    {
      icon: ImageIcon,
      title: 'Data Privacy',
      description: 'Store confidential audio data without detection'
    }
  ];

  const stats = [
    { value: '40+', label: 'PSNR (dB)', sublabel: 'Quality Score' },
    { value: '256-bit', label: 'AES', sublabel: 'Encryption' },
    { value: '<60s', label: 'Processing', sublabel: 'Quick Mode' },
    { value: '99%', label: 'Success', sublabel: 'Rate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  StegaGen
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Secure Steganography</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 sm:gap-4"
            >
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm sm:text-base">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-sm sm:text-base">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 sm:mb-8"
            >
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Advanced GA-Optimized Steganography
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                Hide Audio in Images
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Invisibly & Securely</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
              Advanced audio steganography powered by genetic algorithms and AES-256 encryption. 
              Hide your audio files inside images with military-grade security and perfect imperceptibility.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl hover:shadow-2xl transition-all group">
                  Start Hiding Audio
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{stat.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.sublabel}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">Features</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Cutting-Edge Technology
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powered by advanced algorithms and modern cryptography for unmatched security and quality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br ${feature.gradient}`}>
                  <CardContent className="p-5 sm:p-6 lg:p-8">
                    <feature.icon className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 ${feature.color}`} />
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <Badge className="mb-4 bg-success/10 text-success hover:bg-success/20">Process</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Simple Three-Step Process
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hide your audio in images in just a few clicks
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Upload Files',
                description: 'Select a cover image and the audio file you want to hide',
                icon: ImageIcon,
                color: 'primary'
              },
              {
                step: '02',
                title: 'Optimize & Encrypt',
                description: 'Genetic algorithm finds optimal positions while AES-256 encrypts your audio',
                icon: Zap,
                color: 'accent'
              },
              {
                step: '03',
                title: 'Download & Share',
                description: 'Get your stego image with audio hidden inside, completely imperceptible',
                icon: CheckCircle,
                color: 'success'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="h-full hover:shadow-xl transition-all">
                  <CardContent className="p-6 sm:p-8">
                    <div className={`text-6xl sm:text-7xl lg:text-8xl font-bold text-${step.color}/10 mb-4`}>
                      {step.step}
                    </div>
                    <step.icon className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 text-${step.color}`} />
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8 text-gray-300 dark:text-gray-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <Badge className="mb-4 bg-warning/10 text-warning hover:bg-warning/20">Use Cases</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Trusted By Professionals
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-xl transition-all bg-white dark:bg-gray-900">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <useCase.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                      {useCase.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient shadow-2xl border-0">
              <CardContent className="p-8 sm:p-12 lg:p-16 text-center text-white">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
                  Join thousands of users protecting their audio data with advanced steganography
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">StegaGen Secure</div>
                <div className="text-xs text-gray-400">v1.0.0</div>
              </div>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              © 2024 StegaGen. Advanced Audio Steganography Platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
