# Aetherline Setup Guide

Complete setup and deployment instructions for the Aetherline Industrial Signal Narrative Workbench.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later
- **npm** 9.x or later (comes with Node.js)
- **Git** (for cloning and version control)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/sunkara1111/aetherline.git
cd aetherline
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3
- Additional development dependencies

### 3. Development Mode

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

The application will automatically reload when you make changes to the source code.

### 4. Production Build

To create an optimized production build:

```bash
npm run build
```

This generates a static export in the `out/` directory, ready for deployment.

### 5. Preview Production Build

After building, preview the production version locally:

```bash
npm run start
```

Note: For the static export, you'll need to serve the `out/` directory with a static file server.

## GitHub Pages Deployment

### Automatic Deployment

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

### Manual Setup

If you need to configure GitHub Pages manually:

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Trigger Deployment**
   - Push to the `main` branch
   - Or manually trigger the workflow from the **Actions** tab

3. **Access Your Site**
   - Your site will be available at: `https://sunkara1111.github.io/aetherline/`
   - Allow 2-5 minutes for the first deployment to complete

### Workflow File

The deployment workflow is located at `.github/workflows/deploy.yml` and:
- Builds the Next.js static export
- Uploads to GitHub Pages
- Configures caching for faster builds
- Runs on every push to `main`

## Configuration

### Base Path Configuration

The application is configured for GitHub Pages with a custom base path:

**next.config.js:**
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/aetherline',
  assetPrefix: '/aetherline',
  images: {
    unoptimized: true,
  },
}
```

### Tailwind CSS Configuration

Custom color scheme defined in `tailwind.config.ts`:

```typescript
colors: {
  hud: {
    bg: '#0a0e14',
    panel: '#121820',
    border: '#1e2530',
    accent: '#2dd4bf',
    warning: '#fbbf24',
    danger: '#ef4444',
    text: '#e5e7eb',
    textDim: '#9ca3af',
  },
}
```

## Project Structure

```
aetherline/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── SignalCanvas.tsx     # Signal visualization
│   ├── RunbookPanel.tsx     # Runbook generator
│   └── EventTimeline.tsx    # Event logging
├── lib/
│   ├── types.ts             # TypeScript definitions
│   ├── mockData.ts          # Mock data generator
│   └── runbook.ts           # Runbook logic
├── public/                  # Static assets
├── docs/
│   └── SETUP.md            # This file
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── README.md               # Project documentation
├── LICENSE                 # MIT License
├── COPYRIGHT.md            # Copyright notice
├── NOTICE                  # Legal notices
└── PATENT_NOTICE.md        # Patent status
```

## Development Scripts

### Available Commands

```bash
# Start development server
npm run dev

# Create production build
npm run build

# Start production server (after build)
npm run start

# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint
```

## Troubleshooting

### Build Errors

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**TypeScript errors**
```bash
# Run type checking to see all errors
npm run type-check
```

### Development Server Issues

**Port 3000 already in use**
```bash
# Use a different port
PORT=3001 npm run dev
```

**Changes not reflecting**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### GitHub Pages Deployment Issues

**404 Error on deployed site**
- Verify `basePath` in `next.config.js` matches your repository name
- Ensure GitHub Pages is set to use GitHub Actions
- Check Actions tab for deployment errors

**Assets not loading**
- Verify `assetPrefix` matches `basePath`
- Check browser console for 404 errors
- Ensure all imports use relative paths

## Browser Compatibility

Aetherline is tested and supported on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

### Recommended Settings

For best performance in production:

1. **Use a CDN** for static assets (if self-hosting)
2. **Enable compression** (gzip/brotli) on your web server
3. **Set cache headers** for static assets
4. **Use HTTPS** for GitHub Pages (automatic)

### Local Testing

To test performance locally:

```bash
npm run build

# Serve the out/ directory
npx serve out
```

## Environment Variables

Aetherline runs entirely client-side and requires no environment variables or API keys.

## Security Considerations

- All data is generated client-side
- No data is transmitted to external servers
- No authentication or user data collection
- Safe to use on public networks

## Customization

### Changing Base Path

If deploying to a different path or domain:

1. Update `basePath` and `assetPrefix` in `next.config.js`
2. Rebuild: `npm run build`

### Modifying Mock Data

Edit `lib/mockData.ts` to:
- Add new signal tags
- Adjust alarm thresholds
- Modify simulation behavior
- Change update frequency

### Styling Customization

Edit `tailwind.config.ts` to customize:
- Color scheme
- Typography
- Spacing
- Breakpoints

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For issues, questions, or contributions:

1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide browser and Node.js version information

## License

MIT License - See [LICENSE](../LICENSE) for details

---

**Created by Dineshgopi Sunkara**  
Senior Controls Engineer · Automation Engineer

Last Updated: September 2026
