import { FILE_CONSTRAINTS } from '@/constants';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

export const validateImageFile = (file: File): { valid: boolean; message?: string } => {
  if (!FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported image format. Supported: ${FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS.join(', ')}`,
    };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_IMAGE_SIZE) {
    return {
      valid: false,
      message: `Image size exceeds ${FILE_CONSTRAINTS.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export const validateAvatarFile = (file: File): { valid: boolean; message?: string } => {
  if (!FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      valid: false,
      message: 'Avatar must be PNG or JPEG',
    };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_AVATAR_SIZE) {
    return {
      valid: false,
      message: `Avatar size exceeds ${FILE_CONSTRAINTS.MAX_AVATAR_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export const validateAudioFile = (file: File): { valid: boolean; message?: string } => {
  if (!FILE_CONSTRAINTS.SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported audio format. Supported: ${FILE_CONSTRAINTS.SUPPORTED_AUDIO_FORMATS.join(', ')}`,
    };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_AUDIO_SIZE) {
    return {
      valid: false,
      message: `Audio size exceeds ${FILE_CONSTRAINTS.MAX_AUDIO_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export const validateEncryptionKey = (key: string): { valid: boolean; message?: string } => {
  if (key.length < 16) {
    return { valid: false, message: 'Encryption key must be at least 16 characters' };
  }
  if (key.length > 32) {
    return { valid: false, message: 'Encryption key must not exceed 32 characters' };
  }
  return { valid: true };
};

export const validateGAParameters = (
  populationSize: number,
  generations: number
): { valid: boolean; message?: string } => {
  if (populationSize < 10 || populationSize > 200) {
    return { valid: false, message: 'Population size must be between 10 and 200' };
  }
  if (generations < 10 || generations > 500) {
    return { valid: false, message: 'Generations must be between 10 and 500' };
  }
  return { valid: true };
};
