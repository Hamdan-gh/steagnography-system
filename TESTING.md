# Testing Guide - StegaGen Secure

Comprehensive testing procedures for the Audio Steganography System.

## 🧪 Test Categories

1. Unit Tests
2. Integration Tests
3. End-to-End Tests
4. Performance Tests
5. Security Tests

## ✅ Manual Testing Checklist

### Authentication Tests

**Signup**
- [ ] Can create new account with valid credentials
- [ ] Email validation works
- [ ] Password strength requirements enforced
- [ ] Duplicate email rejected
- [ ] Confirmation email sent (if enabled)

**Login**
- [ ] Can login with correct credentials
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Session persists after page refresh
- [ ] Remember me works

**Logout**
- [ ] Can logout successfully
- [ ] Redirected to login page
- [ ] Session cleared
- [ ] Cannot access protected routes after logout

### File Upload Tests

**Cover Image**
- [ ] PNG files accepted
- [ ] JPEG files accepted
- [ ] JPG files accepted
- [ ] Other formats rejected
- [ ] File size limit enforced (10MB)
- [ ] Min dimensions enforced (512x512)
- [ ] Preview shown after upload
- [ ] Can remove uploaded file

**Audio File**
- [ ] WAV files accepted
- [ ] MP3 files accepted
- [ ] Other formats rejected
- [ ] File size limit enforced (5MB)
- [ ] Preview/info shown after upload
- [ ] Can remove uploaded file

### Embedding Tests

**Successful Embedding**
- [ ] Small image + small audio works
- [ ] Large image + large audio works
- [ ] Progress bar updates correctly
- [ ] Completes within reasonable time
- [ ] Stego image generated
- [ ] Metrics calculated correctly
- [ ] GA chart displays
- [ ] Can download result

**Error Handling**
- [ ] Missing cover image shows error
- [ ] Missing audio file shows error
- [ ] Empty encryption key rejected
- [ ] Short encryption key (<16) rejected
- [ ] Audio too large for image capacity rejected
- [ ] Network errors handled gracefully

**Quality Metrics**
- [ ] PSNR value reasonable (>30dB)
- [ ] MSE value reasonable (<5)
- [ ] SSIM value reasonable (>0.85)
- [ ] Capacity usage shown correctly
- [ ] Quality badges match values

**Genetic Algorithm**
- [ ] GA runs to completion
- [ ] Convergence chart displays
- [ ] Fitness improves over generations
- [ ] Different parameters produce different results
- [ ] Generation count matches setting

### Extraction Tests

**Successful Extraction**
- [ ] Can extract from own stego image
- [ ] Correct encryption key works
- [ ] Extracted audio matches original
- [ ] Audio playable in browser
- [ ] Can download extracted audio
- [ ] Execution time reasonable

**Error Handling**
- [ ] Wrong encryption key fails gracefully
- [ ] Non-stego image fails gracefully
- [ ] Corrupted image handled
- [ ] Missing metadata handled
- [ ] Network errors handled

### Dashboard Tests

**Statistics**
- [ ] Total hidden files count correct
- [ ] Extracted files count correct
- [ ] Images processed count correct
- [ ] Average PSNR calculated correctly
- [ ] Security level displayed

**Charts**
- [ ] Activity chart loads
- [ ] Activity data accurate
- [ ] Chart responsive to window size
- [ ] Tooltips work on hover
- [ ] Legend displays correctly

**Quick Actions**
- [ ] Links work correctly
- [ ] Hover animations smooth
- [ ] Icons display properly

### History Tests

**Display**
- [ ] Recent operations shown
- [ ] Correct metrics displayed
- [ ] Status badges accurate
- [ ] Dates formatted correctly
- [ ] Sorted by date (newest first)

**Actions**
- [ ] Can download stego images
- [ ] Can view operation details
- [ ] Pagination works (if implemented)
- [ ] Filter works (if implemented)

### Profile Tests

**Display**
- [ ] User info shown correctly
- [ ] Avatar displayed (if set)
- [ ] Role badge correct
- [ ] Member since date accurate

**Updates**
- [ ] Can update profile info
- [ ] Can change password
- [ ] Validation works
- [ ] Changes saved to database

### Settings Tests

**Appearance**
- [ ] Dark mode toggle works
- [ ] Theme persists after refresh
- [ ] All components adapt to theme

**Preferences**
- [ ] Settings saved
- [ ] Settings persist
- [ ] Changes apply immediately

## 🔬 Automated Test Examples

### Frontend Unit Tests (Jest/Vitest)

```typescript
// Example: validators.test.ts
describe('Validators', () => {
  test('validateEmail accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('validateEmail rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('validatePassword requires 8+ characters', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
  });
});
```

### Backend Unit Tests (pytest)

```python
# Example: test_metrics.py
def test_calculate_psnr():
    original = np.ones((100, 100, 3), dtype=np.uint8) * 128
    stego = original.copy()
    stego[0, 0, 0] = 129
    
    psnr = calculate_psnr(original, stego)
    assert psnr > 30  # Should be high quality

def test_calculate_ssim():
    original = np.ones((100, 100, 3), dtype=np.uint8) * 128
    stego = original.copy()
    
    ssim = calculate_ssim(original, stego)
    assert ssim == 1.0  # Identical images
```

### Integration Tests

```python
# Example: test_embedding.py
def test_full_embedding_pipeline():
    # Test complete embedding process
    cover_path = 'tests/fixtures/test_image.png'
    audio_path = 'tests/fixtures/test_audio.wav'
    key = 'testEncryptionKey123'
    
    result = embed_audio_in_image(
        cover_path, audio_path, key,
        ga_generations=10,
        ga_population_size=10
    )
    
    assert result['metrics']['psnr'] > 30
    assert result['metrics']['ssim'] > 0.85
    assert 'stego_image_url' in result
```

### E2E Tests (Playwright/Cypress)

```typescript
// Example: embedding.spec.ts
test('complete embedding workflow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Test1234');
  await page.click('button[type=submit]');

  // Navigate to embed page
  await page.click('text=Embed Audio');

  // Upload files
  await page.setInputFiles('[name=coverImage]', 'tests/fixtures/image.png');
  await page.setInputFiles('[name=audioFile]', 'tests/fixtures/audio.wav');

  // Set encryption key
  await page.fill('[name=encryptionKey]', 'testKey12345678');

  // Start embedding
  await page.click('text=Start Embedding');

  // Wait for completion
  await page.waitForSelector('text=Embedding Successful', { timeout: 60000 });

  // Verify results
  expect(await page.isVisible('text=PSNR')).toBeTruthy();
  expect(await page.isVisible('text=Download')).toBeTruthy();
});
```

## 📊 Performance Tests

### Timing Tests

```python
import time

def test_embedding_performance():
    start = time.time()
    
    # Run embedding
    result = embed_audio_in_image(...)
    
    end = time.time()
    duration = end - start
    
    # Should complete in under 60 seconds for 1024x1024 image
    assert duration < 60
```

### Load Tests

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/health

# Using Artillery
artillery quick --count 10 --num 50 http://localhost:5000/api/health
```

### Memory Tests

```python
import tracemalloc

def test_memory_usage():
    tracemalloc.start()
    
    # Run embedding
    result = embed_audio_in_image(...)
    
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    # Should use less than 500MB
    assert peak < 500 * 1024 * 1024
```

## 🔒 Security Tests

### Input Validation

- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] File upload restrictions enforced
- [ ] Path traversal prevented
- [ ] Command injection blocked

### Authentication

- [ ] JWT tokens validated
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Session hijacking prevented
- [ ] CSRF protection enabled

### Authorization

- [ ] Users can only access own data
- [ ] RLS policies enforced
- [ ] Admin routes protected
- [ ] API endpoints authenticated
- [ ] Storage access controlled

### Encryption

- [ ] AES-256 encryption working
- [ ] Key derivation secure
- [ ] Authentication tags verified
- [ ] Nonce uniqueness maintained
- [ ] No plaintext leakage

## 🎯 Test Data

### Sample Images

Create `tests/fixtures/` directory with:

- `small.png` (512x512, ~100KB)
- `medium.png` (1024x1024, ~500KB)
- `large.png` (1920x1080, ~2MB)
- `invalid.txt` (for negative tests)

### Sample Audio

- `short.wav` (5 seconds, ~100KB)
- `medium.wav` (30 seconds, ~500KB)
- `long.wav` (2 minutes, ~2MB)
- `invalid.txt` (for negative tests)

## 📈 Test Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: All major operations
- **Security Tests**: All input points

## 🐛 Bug Tracking

When you find a bug:

1. **Document**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/logs
   - Environment details

2. **Prioritize**:
   - Critical: System unusable
   - High: Major feature broken
   - Medium: Minor feature affected
   - Low: Cosmetic issue

3. **Fix & Verify**:
   - Create failing test
   - Fix the bug
   - Verify test passes
   - Check no regressions

## 🚀 CI/CD Testing

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install Python dependencies
      run: |
        cd python-engine
        pip install -r requirements.txt
    
    - name: Run Python tests
      run: |
        cd python-engine
        pytest
```

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Error tracking enabled

---

**Remember**: Testing is an ongoing process. Add tests as you add features!
