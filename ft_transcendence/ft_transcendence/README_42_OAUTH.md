# 42 OAuth Integration Setup Guide

## Overview

This guide explains how to set up 42 OAuth authentication for your ft_transcendence project, allowing students to log in using their 42 school accounts.

## Prerequisites

- You need a 42 account
- Access to the 42 API (available to all 42 students)

## Step 1: Create a 42 OAuth Application

1. Go to [42 Profile Settings - OAuth Applications](https://profile.intra.42.fr/oauth/applications)
2. Click "New Application"
3. Fill in the application details:

   - **Name**: Your project name (e.g., "ft_transcendence")
   - **Description**: Brief description of your project
   - **Website**: Your project URL (can be localhost for development)
   - **Redirect URI**: `http://localhost:3000/auth/42/callback`
   - **Scopes**: Select "public" (basic profile information)

4. Click "Create Application"
5. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Create a `.env` file in `ft_transcendence/backend/auth-service/`:

```bash
# 42 OAuth Configuration
OAUTH_CLIENT_ID=your_42_client_id_here
OAUTH_CLIENT_SECRET=your_42_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3000/auth/42/callback

# JWT Secret (change this to a secure random string)
JWT_SECRET=a-super-secret-key-that-is-long-enough-make-it-random

# Database
DATABASE_PATH=./db.sqlite
```

**Important**: Replace `your_42_client_id_here` and `your_42_client_secret_here` with the actual values from your 42 OAuth application.

## Step 3: Update OAuth Service Configuration

The OAuth service is already configured to use environment variables. Make sure your `.env` file is properly loaded.

## Step 4: Test the Integration

1. Start your backend service:

   ```bash
   cd ft_transcendence/backend/auth-service
   npm run dev
   ```

2. Start your frontend:

   ```bash
   cd ft_transcendence/frontend
   npm start
   ```

3. Go to the login page (`http://localhost:3000/login`)
4. Click "Login with 42" button
5. You should be redirected to 42's OAuth page
6. After authorization, you'll be redirected back and logged in

## Features Included

### Backend Features

✅ **OAuth Authorization URL Generation** - `/api/users/oauth/42/authorize`
✅ **OAuth Callback Handling** - `/api/users/oauth/42/callback`
✅ **Automatic User Creation** - Creates new users from 42 profile data
✅ **User Profile Updates** - Updates existing users with latest 42 data
✅ **JWT Token Generation** - Issues JWT tokens for authenticated users
✅ **Database Integration** - Stores 42 user data (intra_id, login, avatar)

### Frontend Features

✅ **42 Login Button** - Clean UI button on login page
✅ **OAuth Callback Page** - Handles redirect from 42
✅ **Loading States** - Shows progress during authentication
✅ **Error Handling** - Displays helpful error messages
✅ **Auto Redirect** - Redirects to home page after successful login

### Database Schema

The `users` table now includes:

- `intra_id` - 42 user ID (unique)
- `intra_login` - 42 username (unique)
- `auth_provider` - 'local' or '42'
- `avatar` - Profile picture URL from 42
- `password` - Optional (not required for OAuth users)

## How It Works

1. **User clicks "Login with 42"**

   - Frontend calls `/api/users/oauth/42/authorize`
   - Backend generates 42 OAuth URL with state parameter
   - User is redirected to 42's authorization page

2. **User authorizes on 42**

   - 42 redirects back to `/auth/42/callback` with authorization code
   - Frontend captures code and sends to backend

3. **Backend processes callback**

   - Exchanges authorization code for access token
   - Fetches user profile from 42 API
   - Creates new user or updates existing user
   - Generates JWT token for your system

4. **User is logged in**
   - Frontend receives JWT token and user data
   - User is redirected to home page
   - Authentication context is updated

## API Endpoints

### GET `/api/users/oauth/42/authorize`

Returns authorization URL for 42 OAuth.

**Response:**

```json
{
  "authURL": "https://api.intra.42.fr/oauth/authorize?...",
  "state": "random_state_string"
}
```

### POST `/api/users/oauth/42/callback`

Processes OAuth callback from 42.

**Request:**

```json
{
  "code": "authorization_code_from_42",
  "state": "state_from_authorize_request"
}
```

**Response:**

```json
{
  "accessToken": "jwt_token_for_your_system",
  "user": {
    "id": 123,
    "username": "student_login",
    "email": "student@student.42.fr",
    "avatar": "https://cdn.intra.42.fr/...",
    "auth_provider": "42"
  }
}
```

## Production Deployment

For production deployment:

1. Update `OAUTH_REDIRECT_URI` to your production domain
2. Update the redirect URI in your 42 OAuth application settings
3. Use secure, random values for `JWT_SECRET`
4. Consider using a more robust database (PostgreSQL)
5. Set up proper SSL/TLS certificates

## Security Considerations

- Keep your `CLIENT_SECRET` secure and never expose it in frontend code
- Use HTTPS in production
- Validate state parameters to prevent CSRF attacks
- Implement proper session management
- Consider implementing OAuth token refresh if needed

## Troubleshooting

### "Failed to connect to server"

- Make sure auth service is running on port 3001
- Check if there are any TypeScript compilation errors

### "OAuth authentication failed"

- Verify your CLIENT_ID and CLIENT_SECRET are correct
- Check that redirect URI matches exactly (including http/https)
- Ensure the 42 application has "public" scope enabled

### "User already exists" errors

- This is normal for returning users
- The system will update their profile with latest 42 data

### Database errors

- Make sure SQLite database is writable
- Check that all migrations have been applied

## Need Help?

1. Check the browser console for frontend errors
2. Check auth service logs for backend errors
3. Verify your 42 OAuth application settings
4. Test with a different 42 account

## Development Notes

- The implementation uses SQLite for development
- Password field is optional for OAuth users
- Users can have both local and OAuth authentication
- Avatar URLs are stored and updated from 42 profile
