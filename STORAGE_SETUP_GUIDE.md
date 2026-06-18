# Supabase Storage Setup Guide

## Error You're Seeing

```
POST https://uwvsisaovryftdrauxdp.supabase.co/storage/v1/object/images/... 400 (Bad Request)
```

**Cause:** Storage buckets don't exist in your Supabase project yet.

## Quick Fix (5 minutes)

### Option 1: Run SQL Script (RECOMMENDED) ⭐

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Run Script**
   - Open `supabase_storage_setup.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" button

4. **Verify Success**
   - Should see: "Success. No rows returned"
   - Scroll down to verification section
   - Should show 3 buckets created

### Option 2: Manual Setup via Dashboard

#### Step 1: Create Buckets

1. Go to **Storage** in left sidebar
2. Click **"New bucket"**
3. Create 3 buckets:

**Bucket 1: images**
- Name: `images`
- Public: ✅ Yes
- File size limit: `100 MB`
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

**Bucket 2: audio**
- Name: `audio`
- Public: ❌ No
- File size limit: `20 MB`
- Allowed MIME types: `audio/wav, audio/mp3, audio/mpeg`

**Bucket 3: stego-images**
- Name: `stego-images`
- Public: ✅ Yes
- File size limit: `100 MB`
- Allowed MIME types: `image/png`

#### Step 2: Set Up Policies

For each bucket, add these policies:

**Images bucket policies:**
1. Public can SELECT
2. Users can INSERT to own folder (auth.uid() = folder)
3. Users can UPDATE own files
4. Users can DELETE own files

**Audio bucket policies:**
1. Users can SELECT own files
2. Users can INSERT to own folder
3. Users can DELETE own files

**Stego-images bucket policies:**
1. Public can SELECT
2. Users can INSERT to own folder
3. Users can DELETE own files

---

## After Setup

### Test the Fix:

1. **Refresh your app** (Ctrl+F5)
2. **Go to Profile page**
3. **Try uploading an avatar**
4. **Should work now!** ✅

### What You Can Now Do:

✅ Upload avatar images (Profile page)
✅ Upload cover images (Embed page)
✅ Store stego images (automatically)
✅ Store audio files (if needed)

---

## Troubleshooting

### "Still getting 400 error"

**Check:**
1. Buckets exist (Storage → Check for 3 buckets)
2. Policies are set (Storage → Click bucket → Policies tab)
3. Bucket names match exactly: `images`, `audio`, `stego-images`
4. You're logged in (check top-right of app)

### "403 Forbidden error"

**Cause:** Policies not set correctly

**Fix:**
1. Go to Storage → Select bucket
2. Click "Policies" tab
3. Make sure INSERT policy exists
4. Make sure it checks `auth.uid() = folder`

### "Cannot read public URL"

**Cause:** Bucket not set to public

**Fix:**
1. Go to Storage → Select bucket
2. Click bucket name to open settings
3. Check "Public bucket" checkbox
4. Save

### "File too large"

**Cause:** File exceeds bucket limit

**Fix:**
1. Images and stego-images: 100MB limit
2. Audio: 20MB limit
3. If file larger, compress it first

---

## What Storage Is Used For

### Images Bucket (`images`)
- **Purpose:** User avatars, cover images
- **Access:** Public (anyone can view)
- **Upload:** Only authenticated users to their folder
- **Path format:** `{user_id}/filename.ext`
- **Example:** `292fd1e1-34b4-43ce-82aa-5ec13d8505af/avatar.png`

### Audio Bucket (`audio`)
- **Purpose:** Audio files for embedding (optional)
- **Access:** Private (only owner can view)
- **Upload:** Only authenticated users to their folder
- **Path format:** `{user_id}/filename.ext`

### Stego-Images Bucket (`stego-images`)
- **Purpose:** Generated stego images
- **Access:** Public (anyone can view)
- **Upload:** Only authenticated users to their folder
- **Path format:** `{user_id}/timestamp_stego.png`
- **Example:** `292fd1e1-34b4-43ce-82aa-5ec13d8505af/1781672320_stego.png`

---

## Security Notes

### Why Some Buckets Are Public

**Images & Stego-Images:**
- Set to public so images can be shared/downloaded
- Only stores non-sensitive visual data
- Users control what they upload

**Audio:**
- Private because audio might be sensitive
- Only owner can access their files
- Better privacy protection

### Policy Security

All policies check `auth.uid()`:
- Users can only upload to their own folder
- Users can only delete their own files
- Users can't access other users' private files
- Prevents unauthorized access

---

## File Size Limits

### Current Limits:
- **Images:** 100 MB (large cover images, stego images)
- **Audio:** 20 MB (long audio files)
- **Avatars:** 5 MB (high-res profile pictures)

### Why These Limits:
- Stego images can be 2-3x larger than originals
- Audio quality affects file size
- Balance between quality and performance

### If You Need Larger Limits:
1. Update bucket settings in Supabase
2. Update `FILE_CONSTRAINTS` in `constants/index.ts`
3. Update `MAX_CONTENT_LENGTH` in `app.py`
4. Restart both servers

---

## Verification Checklist

After running the SQL script:

- [ ] 3 buckets exist in Storage
- [ ] Each bucket has correct file size limit
- [ ] Images bucket is public
- [ ] Audio bucket is private
- [ ] Stego-images bucket is public
- [ ] Policies exist for each bucket
- [ ] Can upload avatar (test in Profile page)
- [ ] Can upload cover image (test in Embed page)
- [ ] No more 400 errors in console

---

## Quick Commands

### Check if buckets exist:
```sql
SELECT id, name, public FROM storage.buckets;
```

### Check policies:
```sql
SELECT policyname, bucket_id FROM storage.policies;
```

### Delete and recreate (if needed):
```sql
DELETE FROM storage.buckets WHERE id IN ('images', 'audio', 'stego-images');
-- Then run supabase_storage_setup.sql again
```

---

## Summary

**Problem:** Storage buckets don't exist  
**Solution:** Run `supabase_storage_setup.sql` in Supabase SQL Editor  
**Time:** 5 minutes  
**Result:** Avatar uploads, image storage, and history downloads all work  

🎯 **Just run the SQL script and you're done!**
