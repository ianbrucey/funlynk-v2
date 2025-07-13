# Mobile Design Guidelines
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document provides platform-specific design guidelines for React Native mobile applications, ensuring optimal user experience on both iOS and Android devices while maintaining design consistency.

## Platform-Specific Considerations

### iOS Design Patterns

#### Navigation Patterns
```javascript
// iOS-style navigation header
const iOSHeaderStyle = {
  backgroundColor: '#ffffff',
  borderBottomWidth: 0.5,
  borderBottomColor: '#c7c7cc',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0.5 },
  shadowOpacity: 0.3,
  shadowRadius: 0,
  elevation: 0, // Android only, set to 0 for iOS
};

// iOS navigation title
const iOSNavigationTitle = {
  fontSize: 17,
  fontWeight: '600',
  color: '#000000',
  textAlign: 'center',
};

// iOS back button
const iOSBackButton = {
  color: '#007AFF', // iOS blue
  fontSize: 17,
  fontWeight: '400',
};
```

#### Button Styles
```javascript
// iOS primary button
const iOSPrimaryButton = {
  backgroundColor: '#007AFF',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 24,
  minHeight: 44, // iOS minimum touch target
};

// iOS secondary button
const iOSSecondaryButton = {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: '#007AFF',
  borderRadius: 8,
  paddingVertical: 11, // Adjusted for border
  paddingHorizontal: 23,
  minHeight: 44,
};

// iOS destructive button
const iOSDestructiveButton = {
  backgroundColor: '#FF3B30',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 24,
  minHeight: 44,
};
```

#### List Patterns
```javascript
// iOS table view cell
const iOSListItem = {
  backgroundColor: '#ffffff',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 0.5,
  borderBottomColor: '#c7c7cc',
  minHeight: 44,
};

// iOS section header
const iOSSectionHeader = {
  backgroundColor: '#f2f2f7',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderTopWidth: 0.5,
  borderTopColor: '#c7c7cc',
  borderBottomWidth: 0.5,
  borderBottomColor: '#c7c7cc',
};

// iOS grouped list style
const iOSGroupedList = {
  backgroundColor: '#f2f2f7',
  marginHorizontal: 16,
  marginVertical: 8,
  borderRadius: 10,
  overflow: 'hidden',
};
```

### Android Design Patterns

#### Material Design Navigation
```javascript
// Android navigation header
const androidHeaderStyle = {
  backgroundColor: '#ffffff',
  elevation: 4,
  shadowColor: 'transparent', // Use elevation instead
  borderBottomWidth: 0,
};

// Android navigation title
const androidNavigationTitle = {
  fontSize: 20,
  fontWeight: '500',
  color: '#212121',
  textAlign: 'left', // Android titles are left-aligned
};

// Android back button (hamburger/arrow)
const androidBackButton = {
  color: '#757575',
  fontSize: 24,
};
```

#### Material Button Styles
```javascript
// Android raised button
const androidRaisedButton = {
  backgroundColor: '#2196F3',
  borderRadius: 4, // Material Design uses smaller radius
  paddingVertical: 12,
  paddingHorizontal: 24,
  elevation: 2,
  minHeight: 48, // Android minimum touch target
};

// Android flat button
const androidFlatButton = {
  backgroundColor: 'transparent',
  borderRadius: 4,
  paddingVertical: 12,
  paddingHorizontal: 24,
  minHeight: 48,
};

// Android floating action button
const androidFAB = {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#FF4081',
  elevation: 6,
  position: 'absolute',
  bottom: 16,
  right: 16,
};
```

#### Material List Patterns
```javascript
// Android list item
const androidListItem = {
  backgroundColor: '#ffffff',
  paddingVertical: 16,
  paddingHorizontal: 16,
  minHeight: 48,
  borderBottomWidth: 0, // Material uses dividers differently
};

// Android card style
const androidCard = {
  backgroundColor: '#ffffff',
  marginHorizontal: 8,
  marginVertical: 4,
  borderRadius: 4,
  elevation: 2,
  padding: 16,
};
```

## Screen Layout Patterns

### Safe Area Handling
```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenContainer = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
```

### Header Layouts
```javascript
// Standard header with title and actions
const HeaderLayout = ({ title, leftAction, rightAction }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      {leftAction}
    </View>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <View style={styles.headerRight}>
      {rightAction}
    </View>
  </View>
);

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56, // Standard header height
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#c7c7cc',
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
      },
      android: {
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'left',
      },
    }),
    color: '#000000',
  },
});
```

### Tab Bar Layouts
```javascript
// Bottom tab bar
const TabBarLayout = ({ tabs, activeTab, onTabPress }) => (
  <View style={styles.tabBar}>
    {tabs.map((tab, index) => (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabItem}
        onPress={() => onTabPress(tab.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.tabIcon,
          activeTab === tab.id && styles.tabIconActive
        ]}>
          {tab.icon}
        </View>
        <Text style={[
          styles.tabLabel,
          activeTab === tab.id && styles.tabLabelActive
        ]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const tabBarStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // iOS safe area
    ...Platform.select({
      ios: {
        borderTopWidth: 0.5,
        borderTopColor: '#c7c7cc',
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabIconActive: {
    // Active state styling
  },
  tabLabel: {
    fontSize: 10,
    color: '#8e8e93',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
```

## Touch and Gesture Patterns

### Touch Target Sizes
```javascript
const touchTargets = {
  // Minimum touch target sizes
  ios: {
    minimum: 44, // iOS HIG recommendation
    comfortable: 48,
  },
  android: {
    minimum: 48, // Material Design recommendation
    comfortable: 56,
  },
};

// Ensure minimum touch targets
const TouchableButton = ({ children, style, ...props }) => (
  <TouchableOpacity
    style={[
      {
        minHeight: Platform.OS === 'ios' ? 44 : 48,
        minWidth: Platform.OS === 'ios' ? 44 : 48,
        justifyContent: 'center',
        alignItems: 'center',
      },
      style
    ]}
    {...props}
  >
    {children}
  </TouchableOpacity>
);
```

### Gesture Handling
```javascript
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Swipe to delete pattern
const SwipeToDelete = ({ children, onDelete }) => {
  const translateX = useSharedValue(0);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX < -100) {
        // Trigger delete action
        runOnJS(onDelete)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};
```

### Pull to Refresh
```javascript
import { RefreshControl } from 'react-native';

const PullToRefreshList = ({ data, onRefresh, refreshing }) => (
  <FlatList
    data={data}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#007AFF']} // Android
        tintColor="#007AFF" // iOS
      />
    }
    renderItem={({ item }) => <ListItem item={item} />}
  />
);
```

## Typography for Mobile

### Platform-Specific Font Handling
```javascript
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
});

const typography = {
  // Large title (iOS 11+ style)
  largeTitle: {
    fontSize: 34,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    fontFamily: fontFamily.bold,
    lineHeight: 41,
  },
  
  // Title 1
  title1: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 34,
  },
  
  // Title 2
  title2: {
    fontSize: 22,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 28,
  },
  
  // Title 3
  title3: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 25,
  },
  
  // Headline
  headline: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    fontFamily: fontFamily.semibold,
    lineHeight: 22,
  },
  
  // Body
  body: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  },
  
  // Callout
  callout: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 21,
  },
  
  // Subhead
  subhead: {
    fontSize: 15,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 20,
  },
  
  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 18,
  },
  
  // Caption 1
  caption1: {
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 16,
  },
  
  // Caption 2
  caption2: {
    fontSize: 11,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: fontFamily.regular,
    lineHeight: 13,
  },
};
```

## Animation and Transitions

### Platform-Appropriate Animations
```javascript
import { Easing } from 'react-native-reanimated';

const animations = {
  // iOS-style easing
  ios: {
    easing: Easing.out(Easing.cubic),
    duration: 300,
  },
  
  // Android-style easing
  android: {
    easing: Easing.out(Easing.quad),
    duration: 225,
  },
};

// Fade in animation
const fadeIn = (value, duration = 300) => {
  'worklet';
  return withTiming(value, {
    duration: Platform.OS === 'ios' ? 300 : 225,
    easing: Platform.OS === 'ios' 
      ? Easing.out(Easing.cubic)
      : Easing.out(Easing.quad),
  });
};

// Slide in animation
const slideIn = (value, duration = 300) => {
  'worklet';
  return withSpring(value, {
    damping: Platform.OS === 'ios' ? 20 : 15,
    stiffness: Platform.OS === 'ios' ? 300 : 200,
  });
};
```

### Modal Presentations
```javascript
// iOS-style modal
const iOSModalStyle = {
  backgroundColor: '#ffffff',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  paddingTop: 20,
  paddingHorizontal: 16,
};

// Android-style modal
const androidModalStyle = {
  backgroundColor: '#ffffff',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  paddingTop: 16,
  paddingHorizontal: 16,
  elevation: 16,
};

const ModalContainer = ({ children, visible, onClose }) => (
  <Modal
    visible={visible}
    animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
    presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
    onRequestClose={onClose}
  >
    <View style={Platform.OS === 'ios' ? iOSModalStyle : androidModalStyle}>
      {children}
    </View>
  </Modal>
);
```

## Form Patterns for Mobile

### Mobile-Optimized Input Types
```javascript
const mobileInputTypes = {
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    textContentType: 'emailAddress', // iOS
  },
  
  phone: {
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
    autoCorrect: false,
    textContentType: 'telephoneNumber', // iOS
  },
  
  password: {
    secureTextEntry: true,
    autoCapitalize: 'none',
    autoCorrect: false,
    textContentType: 'password', // iOS
  },
  
  name: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoCorrect: false,
    textContentType: 'name', // iOS
  },
  
  address: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoCorrect: true,
    textContentType: 'fullStreetAddress', // iOS
  },
};
```

### Mobile Form Layout
```javascript
const MobileFormGroup = ({ label, children, error, required }) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
    {error && (
      <Text style={styles.errorText}>{error}</Text>
    )}
  </View>
);

const mobileFormStyles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
});
```

## Accessibility for Mobile

### VoiceOver and TalkBack Support
```javascript
const AccessibleButton = ({ label, hint, onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    accessible={true}
    accessibilityLabel={label}
    accessibilityHint={hint}
    accessibilityRole="button"
    accessibilityState={{ disabled: false }}
  >
    {children}
  </TouchableOpacity>
);

const AccessibleInput = ({ label, value, onChangeText, ...props }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    accessible={true}
    accessibilityLabel={label}
    accessibilityRole="text"
    {...props}
  />
);
```

### Focus Management
```javascript
import { AccessibilityInfo } from 'react-native';

const announceForAccessibility = (message) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Focus management for form errors
const focusFirstError = (errors, refs) => {
  const firstErrorField = Object.keys(errors)[0];
  if (firstErrorField && refs[firstErrorField]) {
    refs[firstErrorField].focus();
    announceForAccessibility(`Error in ${firstErrorField}: ${errors[firstErrorField]}`);
  }
};
```

## Performance Considerations

### Image Optimization
```javascript
import FastImage from 'react-native-fast-image';

const OptimizedImage = ({ source, style, ...props }) => (
  <FastImage
    source={{
      uri: source,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    }}
    style={style}
    resizeMode={FastImage.resizeMode.cover}
    {...props}
  />
);
```

### List Performance
```javascript
const OptimizedList = ({ data, renderItem }) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    updateCellsBatchingPeriod={50}
    initialNumToRender={10}
    windowSize={10}
    getItemLayout={(data, index) => ({
      length: 80, // Estimated item height
      offset: 80 * index,
      index,
    })}
  />
);
```

## Implementation Guidelines

### Platform Detection
```javascript
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Version-specific handling
const isIOS14OrLater = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 14;
const isAndroid10OrLater = Platform.OS === 'android' && Platform.Version >= 29;
```

### Device-Specific Handling
```javascript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const isTablet = width >= 768;
const isSmallScreen = width < 375;
const isLargeScreen = width > 414;

// iPhone X and later detection
const isIPhoneX = Platform.OS === 'ios' && (height >= 812 || width >= 812);
```

These mobile design guidelines ensure that the Funlynk and Funlynk Spark applications provide native-feeling experiences on both iOS and Android while maintaining design consistency across platforms.
