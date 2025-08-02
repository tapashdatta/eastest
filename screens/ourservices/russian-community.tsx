import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, MessageCircle, Users, Calendar, BookOpen, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function RussianCommunityScreen({ onBack }: { onBack?: () => void }) {
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/12/russianspeakers.jpg' }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        />
        
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>Community</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>Russian Speaking Community</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Русскоязычная община ИСККОН Лондон
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Members</CaptionText>
            <TitleText style={styles.statValue}>200+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Calendar size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Programs</CaptionText>
            <TitleText style={styles.statValue}>Weekly</TitleText>
          </View>
          <View style={styles.statItem}>
            <Globe size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Languages</CaptionText>
            <TitleText style={styles.statValue}>Russian</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>О нашей общине</TitleText>
          <BodyText style={styles.sectionText}>
            Русскоязычная община ИСККОН Лондон объединяет преданных из России, Украины, Беларуси и других стран СНГ. Мы проводим программы на русском языке, включая лекции по священным писаниям, киртаны и праздники, создавая духовную атмосферу для всех русскоговорящих преданных.
          </BodyText>
        </View>

        {/* Programs */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Наши программы</TitleText>
          <View style={styles.gridRowWrap}>
            <View style={styles.cardHalf}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Лекции по Бхагавад-гите</TitleText>
              <BodyText style={styles.cardDescription}>
                Еженедельные лекции на русском языке
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <MessageCircle size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Киртаны</TitleText>
              <BodyText style={styles.cardDescription}>
                Совместное воспевание святых имен
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Calendar size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Праздники</TitleText>
              <BodyText style={styles.cardDescription}>
                Празднование ведических праздников
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Users size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Общение</TitleText>
              <BodyText style={styles.cardDescription}>
                Дружеское общение преданных
              </BodyText>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Расписание программ</TitleText>
          <View style={styles.list}>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>Воскресенье</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>15:00 - 17:00</BodyText>
              <CaptionText style={styles.scheduleProgram}>
                Лекция по Бхагавад-гите и киртан
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>Среда</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>19:00 - 20:30</BodyText>
              <CaptionText style={styles.scheduleProgram}>
                Изучение Шримад Бхагаватам
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>Суббота</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>18:00 - 20:00</BodyText>
              <CaptionText style={styles.scheduleProgram}>
                Семейные программы и прасадам
              </CaptionText>
            </View>
          </View>
        </View>

        {/* Services in Russian */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Услуги на русском языке</TitleText>
          <View style={styles.listSmall}>
            <BodyText style={styles.listItemTextSmall}>• Духовное консультирование</BodyText>
            <BodyText style={styles.listItemTextSmall}>• Проведение свадебных церемоний</BodyText>
            <BodyText style={styles.listItemTextSmall}>• Детские программы</BodyText>
            <BodyText style={styles.listItemTextSmall}>• Переводы священных текстов</BodyText>
            <BodyText style={styles.listItemTextSmall}>• Помощь новым преданным</BodyText>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Контактная информация</TitleText>
          <View style={styles.card}>
            <BodyText style={styles.contactText}>
              Для получения дополнительной информации о русскоязычных программах, пожалуйста, свяжитесь с координатором общины.
            </BodyText>
            <BodyText style={styles.contactDetails}>
              Email: russian@iskconlondon.com{'\n'}
              Телефон: +44 20 7437 3662
            </BodyText>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Присоединяйтесь к нам</TitleText>
          <BodyText style={styles.ctaText}>
            Станьте частью нашей дружной русскоязычной общины
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Связаться с нами</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}