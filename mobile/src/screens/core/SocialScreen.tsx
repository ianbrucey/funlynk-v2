import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';

export const SocialScreen: React.FC = () => {
  const mockPosts = [
    {
      id: '1',
      user: 'Sarah Johnson',
      time: '2 hours ago',
      content: 'Had an amazing time at the community cleanup today! Thanks to everyone who participated. 🌱',
      likes: 12,
      comments: 3,
    },
    {
      id: '2',
      user: 'Mike Chen',
      time: '4 hours ago',
      content: 'Looking forward to the book club meeting this Saturday. We\'re discussing "The Midnight Library" - can\'t wait!',
      likes: 8,
      comments: 5,
    },
    {
      id: '3',
      user: 'Community Center',
      time: '6 hours ago',
      content: 'Reminder: Food drive starts tomorrow at 3 PM. Every donation makes a difference! 🤝',
      likes: 24,
      comments: 7,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Community Feed</Text>
          <TouchableOpacity style={styles.messagesButton}>
            <Text style={styles.messagesButtonText}>💬</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createPostCard}>
          <Text style={styles.createPostText}>What's happening in your community?</Text>
          <View style={styles.createPostActions}>
            <TouchableOpacity style={styles.createPostButton}>
              <Text style={styles.createPostButtonText}>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostButton}>
              <Text style={styles.createPostButtonText}>📍 Location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.postsContainer}>
          {mockPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {post.user.charAt(0)}
                  </Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.userName}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>👍</Text>
                  <Text style={styles.actionText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📤</Text>
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>Suggested Connections</Text>
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionAvatar}>
              <Text style={styles.suggestionAvatarText}>A</Text>
            </View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionName}>Alex Rodriguez</Text>
              <Text style={styles.suggestionMutual}>2 mutual connections</Text>
            </View>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.textStyles.title3,
    color: theme.colors.textPrimary,
  },
  messagesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  messagesButtonText: {
    fontSize: 20,
  },
  createPostCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  createPostText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
  },
  createPostActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  createPostButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  createPostButtonText: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  postsContainer: {
    marginBottom: theme.spacing.xl,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userAvatarText: {
    ...theme.textStyles.subhead,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  postMeta: {
    flex: 1,
  },
  userName: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  postTime: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  postContent: {
    ...theme.textStyles.body,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  suggestionsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.textStyles.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  suggestionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  suggestionAvatarText: {
    ...theme.textStyles.caption1,
    color: theme.colors.textOnSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    ...theme.textStyles.subhead,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  suggestionMutual: {
    ...theme.textStyles.caption1,
    color: theme.colors.textSecondary,
  },
  connectButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  connectButtonText: {
    ...theme.textStyles.caption1,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default SocialScreen;
