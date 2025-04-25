# 🎬 Suetube — YouTube Clone

A full-stack YouTube clone built with **Node.js**, **Express**, **MongoDB**, and **AWS S3**. Users can upload, stream, and interact with videos.

## ✨ Features

- **Authentication**: Join, Login, Logout with GitHub OAuth
- **Video Management**: Upload, stream, and process videos using AWS S3
- **Video Processing**: FFmpeg for video optimization and thumbnail generation
- **Social Features**: Comments, likes, and user profiles
- **Search**: Full-text search functionality
- **Modern Frontend**: SCSS + Webpack + Pug for responsive design

## ⚙️ Tech Stack

- **Backend**:
  - Node.js & Express for server
  - MongoDB for database
  - AWS S3 for file storage
  - FFmpeg for video processing
- **Frontend**:
  - Pug for templating
  - SCSS for styling
  - Webpack for bundling
- **DevOps**:
  - Babel for transpilation
  - Docker for containerization
  - GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account (for S3)
- GitHub OAuth App
- FFmpeg

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/feelsuegood/youtube-clone.git
   cd youtube-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   COOKIE_SECRET=your_cookie_secret
   DB_URL=mongodb://localhost:27017/your_database_name
   GH_CLIENT=your_github_client_id
   GH_SECRET=your_github_client_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   BUCKET_NAME=your_s3_bucket_name
   ```

### Development

1. **Start the development server**

   ```bash
   npm run dev:server   # Backend server
   npm run dev:assets   # Frontend assets
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

## 🐳 Deployment

The application is Dockerized and ready for deployment.  
Make sure your application listens on `0.0.0.0:3000`.

## 📁 Project Structure

```
src/
├── models/         # Database models
├── routers/        # Express routes
├── views/          # Pug templates
├── client/         # Frontend assets
│   ├── js/        # JavaScript files
│   ├── scss/      # SCSS styles
│   └── static/    # Static assets
├── init.js         # Application initialization
└── server.js       # Server entry point
```

## 🙏 Acknowledgement

- [Nomad Coders YouTube Clone](https://nomadcoders.co/wetube)
- [Youtube](https://www.youtube.com/)
