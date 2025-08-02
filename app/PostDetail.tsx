// app/PostDetail.tsx
// This file should be placed in your app directory for Expo Router

import React, { useState, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, BodyText, TitleText } from '@/components/Text';
import { 
  ArrowLeft,
  Bookmark,
  Clock,
  Star,
  Share,
  Heart,
  MessageCircle,
  Eye,
  MapPin
} from 'lucide-react-native';

const { height } = Dimensions.get('window');

// Define the Post interface for this screen
interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  rating: number;
  location: string;
  likes: number;
  comments: number;
  views: number;
  isBookmarked: boolean;
  isLiked: boolean;
}

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use useMemo to parse post data only when params.post changes
  const post = useMemo(() => {
    if (params.post && typeof params.post === 'string') {
      try {
        const postData = JSON.parse(params.post);
        console.log('Parsed post data:', postData);
        return postData as Post;
      } catch (error) {
        console.error('Error parsing post data:', error);
        return null;
      }
    }
    return null;
  }, [params.post]);

  // Initialize state based on parsed post data
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false);
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likes, setLikes] = useState(post?.likes || 0);

  const handleBack = () => {
    router.back();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically update the bookmark status in your state management/API
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // Here you would typically update the like status in your state management/API
  };

  const handleShare = () => {
    console.log('Share post');
    // Implement native sharing functionality
  };

  if (!post) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8
          }}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#333', fontSize: 18 }}>Post not found</Text>
        <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
          The post data was not passed correctly.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Hero Image with Overlay */}
      <View style={{ position: 'relative', height: height * 0.4 }}>
        <Image 
          source={{ uri: post.image }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
        
        {/* Header Controls */}
        <View style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          zIndex: 1
        }}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleBookmark} 
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <Bookmark 
              size={24} 
              color="#fff" 
              fill={isBookmarked ? '#fff' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        {/* Hero Content */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20
        }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginBottom: 8
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              {post.category}
            </Text>
          </View>
          <Text style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8
          }}>
            {post.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <MapPin size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>
                {post.location}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>
                {post.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={{ flex: 1 }}>
        {/* Tab Navigation */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingTop: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0'
        }}>
          <TouchableOpacity 
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: activeTab === 'overview' ? 2 : 0,
              borderBottomColor: '#6366f1'
            }}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={{
              color: activeTab === 'overview' ? '#6366f1' : '#666',
              fontWeight: '600'
            }}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: activeTab === 'details' ? 2 : 0,
              borderBottomColor: '#6366f1'
            }}
            onPress={() => setActiveTab('details')}
          >
            <Text style={{
              color: activeTab === 'details' ? '#6366f1' : '#666',
              fontWeight: '600'
            }}>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0'
        }}>
          <View style={{ alignItems: 'center' }}>
            <Clock size={20} color="#666" />
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {post.readTime}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Eye size={20} color="#666" />
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {post.views}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Star size={20} color="#FFD700" fill="#FFD700" />
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {post.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Engagement Row */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0'
        }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={isLiked ? '#ef4444' : '#666'}
              fill={isLiked ? '#ef4444' : 'transparent'}
            />
            <Text style={{
              color: isLiked ? '#ef4444' : '#666',
              marginLeft: 4
            }}>
              {likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MessageCircle size={20} color="#666" />
            <Text style={{ color: '#666', marginLeft: 4 }}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={handleShare}
          >
            <Share size={20} color="#666" />
            <Text style={{ color: '#666', marginLeft: 4 }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' ? (
            <>
              <BodyText style={{ 
                fontSize: 16, 
                lineHeight: 24, 
                color: '#333',
                marginTop: 20 
              }}>
                {post.content}
              </BodyText>
              
              <View style={{ marginTop: 24 }}>
                <TitleText style={{ fontSize: 18, marginBottom: 12 }}>Event Details</TitleText>
                <BodyText style={{ fontSize: 16, lineHeight: 24, color: '#666' }}>
                  Join us for this special celebration that brings together our community in devotion and joy. 
                  This event features traditional ceremonies, spiritual discourse, and prasadam distribution.
                </BodyText>
              </View>

              <View style={{ marginTop: 24 }}>
                <TitleText style={{ fontSize: 18, marginBottom: 12 }}>What to Expect</TitleText>
                <BodyText style={{ fontSize: 16, lineHeight: 24, color: '#666' }}>
                  • Traditional prayers and ceremonies{'\n'}
                  • Spiritual discourse and teachings{'\n'}
                  • Community prasadam (blessed food){'\n'}
                  • Cultural performances{'\n'}
                  • Opportunity for personal reflection
                </BodyText>
              </View>
            </>
          ) : (
            <>
              <View style={{ marginTop: 20 }}>
                <TitleText style={{ fontSize: 18, marginBottom: 12 }}>Location & Timing</TitleText>
                <BodyText style={{ fontSize: 16, lineHeight: 24, color: '#666' }}>
                  ISKCON London Temple{'\n'}
                  10 Soho Street, London W1D 3DL{'\n'}
                  {new Date(post.date).toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </BodyText>
              </View>

              <View style={{ marginTop: 24 }}>
                <TitleText style={{ fontSize: 18, marginBottom: 12 }}>Requirements</TitleText>
                <BodyText style={{ fontSize: 16, lineHeight: 24, color: '#666' }}>
                  • Modest dress code required{'\n'}
                  • Remove shoes before entering temple{'\n'}
                  • Silence mobile devices during ceremonies{'\n'}
                  • Photography permitted in designated areas only
                </BodyText>
              </View>

              <View style={{ marginTop: 24 }}>
                <TitleText style={{ fontSize: 18, marginBottom: 12 }}>Contact Information</TitleText>
                <BodyText style={{ fontSize: 16, lineHeight: 24, color: '#666' }}>
                  Phone: +44 20 7437 3662{'\n'}
                  Email: info@iskconlondon.com{'\n'}
                  Website: iskconlondon.com
                </BodyText>
              </View>
            </>
          )}
          
          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action Button */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff'
        }}>
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#6366f1',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginRight: 12
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Join Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center'
            }}
            onPress={handleShare}
          >
            <Share size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}