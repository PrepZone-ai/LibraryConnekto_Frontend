# Vercel Deployment Guide for Library Connekto

This guide will help you deploy the Library Connekto frontend to Vercel with the correct backend API configuration.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Library Connekto frontend repository
3. Backend API running at: `https://ddlsandeep7-libraryconnekto1.hf.space`

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository: `PrepZone-ai/LibraryConnekto_Frontend`

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add the following variable:
     ```
     Name: VITE_API_BASE_URL
     Value: https://ddlsandeep7-libraryconnekto1.hf.space/api/v1
     Environment: Production, Preview, Development
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided Vercel URL

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   cd "Library Connekto"
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_BASE_URL
   # Enter: https://ddlsandeep7-libraryconnekto1.hf.space/api/v1
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Environment Configuration

### Production Environment
The production environment is automatically configured to use:
```
VITE_API_BASE_URL=https://ddlsandeep7-libraryconnekto1.hf.space/api/v1
```

### Local Development
For local development, create a `.env` file in the project root:
```bash
# Copy the template
cp env.template .env

# Edit .env file
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Configuration Files

The following files are included for Vercel deployment:

- `vercel.json` - Vercel configuration with routing and environment variables
- `.vercelignore` - Files to ignore during deployment
- `vercel.env.example` - Example environment variables

## Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel
4. SSL certificate will be automatically provisioned

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check that the build command `npm run build` works locally
- Verify environment variables are set correctly

### API Connection Issues
- Verify the backend API is accessible at the configured URL
- Check CORS settings on the backend
- Ensure the API URL includes the correct path (`/api/v1`)

### Environment Variables
- Make sure `VITE_API_BASE_URL` is set in Vercel dashboard
- Environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Redeploy after changing environment variables

## Monitoring

- Use Vercel Analytics to monitor performance
- Check Vercel Functions logs for any server-side issues
- Monitor API response times and errors

## Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Vercel will automatically trigger a new deployment
3. Environment variables will persist across deployments

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Library Connekto Issues: Create an issue in the GitHub repository
