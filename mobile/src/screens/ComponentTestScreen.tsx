import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { 
  Container, 
  Card, 
  Row, 
  Column, 
  Spacer,
  Button, 
  Text, 
  Input, 
  Avatar,
  Form,
  FormInput,
  LoadingScreen
} from '@/components';
import { useAppDispatch } from '@/store';
import { showToast } from '@/store/slices/uiSlice';

export const ComponentTestScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    dispatch(showToast({ 
      message: 'Form submitted successfully!', 
      type: 'success' 
    }));
  };

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    dispatch(showToast({ 
      message: `This is a ${type} toast message!`, 
      type 
    }));
  };

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  if (showLoadingScreen) {
    return (
      <LoadingScreen 
        message="Testing loading screen..." 
        onRetry={() => setShowLoadingScreen(false)}
      />
    );
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Column gap="lg">
          {/* Typography Test */}
          <Card>
            <Text variant="h2" align="center" color="primary">
              Component Library Test
            </Text>
            <Spacer size="sm" />
            <Text variant="body" align="center" color="textSecondary">
              Testing all our custom components
            </Text>
          </Card>

          {/* Button Tests */}
          <Card>
            <Text variant="h4" color="textPrimary">Buttons</Text>
            <Spacer size="md" />
            <Column gap="sm">
              <Button variant="primary" onPress={() => Alert.alert('Primary Button')}>
                Primary Button
              </Button>
              <Button variant="secondary" onPress={() => Alert.alert('Secondary Button')}>
                Secondary Button
              </Button>
              <Button variant="outline" onPress={() => Alert.alert('Outline Button')}>
                Outline Button
              </Button>
              <Button variant="ghost" onPress={() => Alert.alert('Ghost Button')}>
                Ghost Button
              </Button>
              <Row gap="sm">
                <Button variant="success" size="sm" onPress={() => Alert.alert('Success')}>
                  Success
                </Button>
                <Button variant="danger" size="sm" onPress={() => Alert.alert('Danger')}>
                  Danger
                </Button>
              </Row>
              <Button 
                variant="primary" 
                loading={loading} 
                onPress={handleLoadingTest}
              >
                {loading ? 'Loading...' : 'Test Loading'}
              </Button>
            </Column>
          </Card>

          {/* Avatar Tests */}
          <Card>
            <Text variant="h4" color="textPrimary">Avatars</Text>
            <Spacer size="md" />
            <Row gap="md" justify="space-around">
              <Avatar name="John Doe" size={50} />
              <Avatar name="Jane Smith" size={50} variant="rounded" />
              <Avatar size={50} variant="square" />
              <Avatar 
                source="https://via.placeholder.com/50" 
                size={50} 
                onPress={() => Alert.alert('Avatar pressed')}
              />
            </Row>
          </Card>

          {/* Form Tests */}
          <Card>
            <Text variant="h4" color="textPrimary">Forms</Text>
            <Spacer size="md" />
            <Form onSubmit={handleFormSubmit}>
              <FormInput
                name="email"
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email format'
                  }
                }}
              />
              <FormInput
                name="password"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                }}
              />
              <FormInput
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                helperText="This will be displayed on your profile"
                rules={{ required: 'Name is required' }}
              />
              <Button variant="primary" type="submit">
                Submit Form
              </Button>
            </Form>
          </Card>

          {/* Toast Tests */}
          <Card>
            <Text variant="h4" color="textPrimary">Toast Messages</Text>
            <Spacer size="md" />
            <Column gap="sm">
              <Row gap="sm">
                <Button 
                  variant="success" 
                  size="sm" 
                  onPress={() => handleShowToast('success')}
                >
                  Success
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onPress={() => handleShowToast('error')}
                >
                  Error
                </Button>
              </Row>
              <Row gap="sm">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onPress={() => handleShowToast('warning')}
                >
                  Warning
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onPress={() => handleShowToast('info')}
                >
                  Info
                </Button>
              </Row>
            </Column>
          </Card>

          {/* Loading Screen Test */}
          <Card>
            <Text variant="h4" color="textPrimary">Loading Screen</Text>
            <Spacer size="md" />
            <Button 
              variant="primary" 
              onPress={() => setShowLoadingScreen(true)}
            >
              Show Loading Screen
            </Button>
          </Card>

          <Spacer size="xl" />
        </Column>
      </ScrollView>
    </Container>
  );
};
