# Task 001: React Native Project Setup
**Agent**: Mobile Foundation Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: None (Starting point for mobile development)  

## Overview
Set up the complete React Native project with TypeScript, development environment configuration, build tools, and essential dependencies for both Funlynk Core and Spark applications.

## Prerequisites
- Node.js 18+ installed
- React Native CLI installed
- Android Studio and Xcode set up
- Git repository access

## Step-by-Step Implementation

### Step 1: Initialize React Native Project (45 minutes)

**Create new React Native project with TypeScript:**
```bash
# Navigate to project root
cd /path/to/funlynk-v2

# Create React Native project
npx react-native@latest init FunlynkMobile --template react-native-template-typescript

# Move into mobile directory
cd FunlynkMobile

# Initialize git if not already done
git init
git add .
git commit -m "Initial React Native project setup"
```

**Update project structure:**
```
FunlynkMobile/
├── src/
│   ├── components/           # Shared components
│   ├── screens/             # Screen components
│   │   ├── core/           # Funlynk Core screens
│   │   └── spark/          # Spark screens
│   ├── navigation/          # Navigation configuration
│   ├── services/           # API services
│   ├── store/              # Redux store
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # App constants
│   └── assets/             # Images, fonts, etc.
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
└── __tests__/              # Test files
```

**Create directory structure:**
```bash
mkdir -p src/{components,screens/{core,spark},navigation,services,store,utils,types,constants,assets}
mkdir -p src/components/{common,forms,ui}
mkdir -p src/services/{api,auth,storage}
mkdir -p src/store/{slices,middleware}
mkdir -p src/assets/{images,fonts,icons}
```

### Step 2: Configure TypeScript and ESLint (30 minutes)

**Update tsconfig.json:**
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/screens/*": ["screens/*"],
      "@/navigation/*": ["navigation/*"],
      "@/services/*": ["services/*"],
      "@/store/*": ["store/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/constants/*": ["constants/*"],
      "@/assets/*": ["assets/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "__tests__/**/*"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios"
  ]
}
```

**Update .eslintrc.js:**
```javascript
module.exports = {
  root: true,
  extends: [
    '@react-native',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
```

**Create .prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Step 3: Install Essential Dependencies (60 minutes)

**Install navigation dependencies:**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

**Install state management:**
```bash
npm install @reduxjs/toolkit react-redux redux-persist
npm install @types/react-redux
```

**Install API and networking:**
```bash
npm install axios react-query @tanstack/react-query
npm install react-native-mmkv # For fast storage
```

**Install UI and styling:**
```bash
npm install react-native-vector-icons react-native-svg
npm install react-native-paper # Material Design components
npm install styled-components @types/styled-components
```

**Install utilities:**
```bash
npm install react-native-device-info
npm install react-native-permissions
npm install react-native-image-picker
npm install react-native-date-picker
npm install react-native-maps
npm install @react-native-async-storage/async-storage
```

**Install development dependencies:**
```bash
npm install --save-dev @types/react-native-vector-icons
npm install --save-dev reactotron-react-native reactotron-redux
npm install --save-dev flipper-plugin-react-query
```

### Step 4: Configure Platform-Specific Setup (90 minutes)

**iOS Configuration (ios/Podfile):**
```ruby
# Add to ios/Podfile
platform :ios, '12.4'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'FunlynkMobile' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false,
    :flipper_configuration => FlipperConfiguration.enabled,
    :app_clip_enabled => false
  )

  # Add permissions
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"
  pod 'Permission-LocationWhenInUse', :path => "#{permissions_path}/LocationWhenInUse"

  target 'FunlynkMobileTests' do
    inherit! :complete
  end

  post_install do |installer|
    react_native_post_install(installer)
  end
end
```

**Android Configuration (android/app/build.gradle):**
```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion

    defaultConfig {
        applicationId "com.funlynk.mobile"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        multiDexEnabled true
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            applicationIdSuffix ".debug"
            debuggable true
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }

    packagingOptions {
        pickFirst "lib/x86/libc++_shared.so"
        pickFirst "lib/x86_64/libc++_shared.so"
        pickFirst "lib/arm64-v8a/libc++_shared.so"
        pickFirst "lib/armeabi-v7a/libc++_shared.so"
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.facebook.react:react-native:+"
    implementation "androidx.multidex:multidex:2.0.1"
    
    if (enableHermes) {
        def hermesPath = "../../node_modules/hermes-engine/android/"
        debugImplementation files(hermesPath + "hermes-debug.aar")
        releaseImplementation files(hermesPath + "hermes-release.aar")
    } else {
        implementation jscFlavor
    }
}
```

**Update AndroidManifest.xml:**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Step 5: Create Environment Configuration (45 minutes)

**Create environment configuration (src/constants/config.ts):**
```typescript
export interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  VERSION: string;
  BUILD_NUMBER: string;
}

const development: AppConfig = {
  API_BASE_URL: 'http://localhost:8000/api/v1',
  API_TIMEOUT: 10000,
  ENVIRONMENT: 'development',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
};

const staging: AppConfig = {
  API_BASE_URL: 'https://staging-api.funlynk.com/api/v1',
  API_TIMEOUT: 15000,
  ENVIRONMENT: 'staging',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
};

const production: AppConfig = {
  API_BASE_URL: 'https://api.funlynk.com/api/v1',
  API_TIMEOUT: 15000,
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
};

const getConfig = (): AppConfig => {
  if (__DEV__) {
    return development;
  }
  
  // Add logic to determine staging vs production
  return production;
};

export const Config = getConfig();
```

**Create app constants (src/constants/index.ts):**
```typescript
export const APP_CONSTANTS = {
  // App Info
  APP_NAME: 'Funlynk',
  APP_VERSION: '1.0.0',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    APP_SETTINGS: 'app_settings',
    ONBOARDING_COMPLETED: 'onboarding_completed',
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    CORE: {
      EVENTS: '/core/events',
      USERS: '/core/users',
      SOCIAL: '/core/social',
    },
    SPARK: {
      SCHOOLS: '/spark/schools',
      PROGRAMS: '/spark/programs',
      BOOKINGS: '/spark/bookings',
    },
  },
  
  // UI Constants
  SCREEN_PADDING: 16,
  BORDER_RADIUS: 8,
  ANIMATION_DURATION: 300,
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export * from './config';
```

## Acceptance Criteria

### Project Setup
- [ ] React Native project created with TypeScript template
- [ ] Proper directory structure established
- [ ] Git repository initialized with initial commit
- [ ] All essential dependencies installed and configured

### Development Environment
- [ ] TypeScript configuration with strict mode and path mapping
- [ ] ESLint and Prettier configured with consistent rules
- [ ] Development scripts configured in package.json
- [ ] Environment-specific configuration system

### Platform Configuration
- [ ] iOS project configured with proper permissions and pods
- [ ] Android project configured with proper permissions and gradle setup
- [ ] Both platforms build successfully
- [ ] Metro bundler configuration optimized

### Dependencies and Tools
- [ ] Navigation libraries installed and ready
- [ ] State management (Redux Toolkit) configured
- [ ] API client libraries (Axios, React Query) installed
- [ ] UI component libraries (React Native Paper) installed
- [ ] Development tools (Reactotron, Flipper) configured

## Testing Instructions

### Build Testing
```bash
# Test iOS build
cd ios && pod install && cd ..
npx react-native run-ios

# Test Android build
npx react-native run-android

# Test TypeScript compilation
npx tsc --noEmit

# Test linting
npm run lint

# Test Metro bundler
npx react-native start --reset-cache
```

### Environment Testing
```bash
# Test development environment
npm run start

# Test production build
npm run build:android
npm run build:ios
```

## Next Steps
After completion, proceed to:
- Task 002: Navigation System Implementation
- Coordinate with backend teams on API integration
- Set up CI/CD pipeline for mobile builds

## Documentation
- Document development environment setup process
- Create mobile development guidelines
- Document build and deployment procedures
- Create troubleshooting guide for common setup issues
