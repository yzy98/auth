# @yzy98/auth

A lightweight, type-safe authentication library for modern JavaScript/TypeScript applications with built-in Next.js integration.

## ✨ Features

- **🔐 Stateful Authentication** - Session-based authentication with cookie management
- **📝 Full TypeScript Support** - Complete type safety with comprehensive type definitions
- **⚡️ Zero Configuration** - Simple setup with sensible defaults
- **🚀 Next.js Integration** - Built-in support for Next.js App Router
- **🔒 Secure by Default** - Password hashing, HTTP-only cookies, and secure session management
- **📱 React Hooks** - Client-side hooks for session management
- **🗄️ Database Agnostic** - Works with any DrizzleORM-compatible database

## 📦 Installation

```bash
npm install @yzy98/auth
# or
yarn add @yzy98/auth
# or
pnpm add @yzy98/auth
```

## 🚀 Quick Start

### 1. Server-Side Setup

```typescript
// lib/auth.ts
import { createAuth } from '@yzy98/auth/server';
import { db } from './db';

export const auth = createAuth({ db });
```

### 2. Server-Side Usage

```typescript
// app/dashboard/page.ts
import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }
}
```

### 3. Next.js API Routes

```typescript
// app/api/auth/[...all]/route.ts
import { NextJsRouter } from '@yzy98/auth/integrations/next-js';
import { auth } from '@/lib/auth';

export const { POST, GET } = NextJsRouter(auth);
```

### 4. Client-Side Usage

```typescript
// lib/auth-client.ts
import { createAuthClient } from '@yzy98/auth/client';

export const { signUp, signIn, signOut, useSession } = createAuthClient();
```

```tsx
// components/auth-form.tsx
'use client';

import { useSession } from '@/lib/auth-client';

export function AuthStatus() {
  const { data, isLoading, error } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data ? (
        <p>Welcome, {data.user.name}!</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

## 📖 API Reference

### Server API

#### `createAuth(config: AuthConfig): AuthInstance`

Creates an authentication instance with the provided database configuration.

```typescript
interface AuthConfig {
  db: NeonHttpDatabase; // DrizzleORM database instance
}
```

#### AuthInstance Methods

- `signUp(params: SignUpParams, callback?: SignUpCallback)` - Register a new user
- `signIn(params: SignInParams, callback?: SignInCallback)` - Authenticate a user
- `signOut(callback?: SignOutCallback)` - Terminate current session
- `getSession()` - Retrieve current session data

### Client API

#### `createAuthClient(): AuthClientInstance`

Creates a client-side authentication instance.

#### AuthClientInstance Methods

- `signUp(params: SignUpParams, callback?: SignUpCallback)` - Client registration
- `signIn(params: SignInParams, callback?: SignInCallback)` - Client authentication
- `signOut(callback?: SignOutCallback)` - Client session termination
- `useSession(): UseSessionResult` - React hook for session management

### Types

Comprehensive TypeScript definitions including:

- `User` - Database user entity
- `Session` - Session metadata
- `PickedUser` - Client-safe user data
- `Result<T, E>` - Operation result type
- Various callback and parameter types

## 🗃️ Database Schema

The library requires the following database tables:

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔧 Configuration

### Environment Variables

```bash
# Database connection (example for Neon)
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- HTTP-only cookies for session storage
- Secure cookie flags in production
- Session expiration management
- CSRF protection through same-site cookies
- No sensitive data exposed to client

## 📋 Error Handling

The library provides comprehensive error handling:

```typescript
const result = await signIn({ email, password });

if (result.error) {
  // Handle specific error types
  console.error('Authentication failed:', result.error);
} else {
  // Success - user data available
  console.log('Welcome:', result.data.user);
}
```

## 🔄 Session Management

Sessions are automatically managed with:

- 24-hour expiration by default
- Automatic cleanup of expired sessions
- Client-side session state synchronization
- Manual refresh capability

## 🌐 Browser Support

- Modern browsers with Fetch API support
- React 19+ for hook functionality
- Next.js 15+ for App Router integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Build: `pnpm build`

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For bugs and feature requests, please open an issue on GitHub.

---

Built with ❤️ by @yzy98
