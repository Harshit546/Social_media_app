# AWS S3 Setup Guide for Thumbnail Storage

This guide helps you set up AWS S3 for free tier thumbnail storage in the social media app.

## Prerequisites
- AWS Account (with free tier eligibility)
- AWS Access Keys

## Step 1: Create an AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Enter bucket name (must be globally unique, e.g., `social-media-thumbnails-yourname`)
4. Select region: `us-east-1` (recommended for free tier)
5. **IMPORTANT**: Uncheck "Block all public access" to allow public read access
6. Click "Create bucket"

## Step 2: Create IAM User with S3 Access

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iamv2/)
2. Click "Users" → "Create user"
3. Username: `social-media-app`
4. Skip "Set permissions" for now
5. Click "Create user"
6. Open the created user
7. Go to "Security credentials" → "Create access key"
8. Select "Application running outside AWS"
9. Click "Create access key"
10. **Copy and save**:
    - Access Key ID
    - Secret Access Key
    - ⚠️ **Keep these secret!**

## Step 3: Add S3 Permissions to IAM User

1. Open the IAM user you created
2. Click "Add permissions" → "Attach policies directly"
3. Search for and select: `AmazonS3FullAccess`
4. Click "Add permissions"

## Step 4: Configure Backend Environment

1. Open `/backend/.env`
2. Add or update these variables:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
```

## Step 5: Test the Setup

1. Start the backend: `npm run dev`
2. Create a post with a thumbnail image
3. Check AWS S3 Console to verify the file was uploaded
4. Verify the thumbnail loads in the frontend

## S3 Free Tier Limits

- **5 GB** storage
- **20,000** GET requests per month
- **2,000** PUT requests per month
- **100** MB/s bandwidth

This is sufficient for a small social media app during development/testing.

## Troubleshooting

### Error: "S3 bucket not configured"
- Verify `AWS_S3_BUCKET` is set in `.env`
- Restart the backend server

### Error: "Access Denied" or "InvalidAccessKeyId"
- Check AWS credentials are correct
- Verify IAM user has S3 permissions
- Check credentials don't have extra spaces in `.env`

### Files not uploading
- Check bucket ACL allows public read access
- Verify bucket region matches `AWS_S3_REGION` in `.env`
- Check file size is under 5MB

### S3 URLs not working in frontend
- Ensure bucket has public read permissions
- Verify the S3 URL format is correct
- Check browser console for CORS issues (may need CORS configuration on bucket)

## Optional: Configure CORS on S3 Bucket

If you encounter CORS errors when loading images:

1. Go to S3 Console → Your bucket
2. Click "Permissions" → "CORS"
3. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["http://localhost:5173"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

## Security Best Practices

1. ⚠️ **Never commit `.env` file to git** - add it to `.gitignore`
2. Use IAM roles instead of access keys for production deployments
3. Implement bucket lifecycle policies to delete old thumbnails
4. Consider using CloudFront for better performance
5. Implement rate limiting on upload endpoints

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for Node.js](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
