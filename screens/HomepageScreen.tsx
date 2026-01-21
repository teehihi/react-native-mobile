import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { PersonalInfo, Skill } from '../types/profile';

const HomepageScreen: React.FC = () => {
  // Personal information data
  const personalInfo: PersonalInfo = {
    name: 'Nguyễn Nhật Thiên',
    age: 20,
    occupation: 'Sinh viên IT',
    school: 'ĐH Công nghệ Kỹ thuật TP.HCM',
    major: 'Công nghệ thông tin',
  };

  // Skills data
  const skills: Skill[] = [
    { name: 'TypeScript/React Native', level: 85, color: '#3498db' },
    { name: 'JavaScript/ES6+', level: 90, color: '#f1c40f' },
    { name: 'HTML/CSS', level: 88, color: '#e74c3c' },
    { name: 'Git/GitHub', level: 80, color: '#e67e22' },
    { name: 'Mobile Development', level: 82, color: '#1abc9c' },
  ];

  const hobbies = [
    'Lập trình ứng dụng di động',
    'Học hỏi công nghệ mới',
    'Chơi game và xem phim',
    'Du lịch và khám phá',
  ];

  const SkillBar: React.FC<{ skill: Skill }> = ({ skill }) => (
    <View style={styles.skillContainer}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <Text style={styles.skillPercent}>{skill.level}%</Text>
      </View>
      <View style={styles.skillBarBackground}>
        <View
          style={[
            styles.skillBarFill,
            { width: `${skill.level}%`, backgroundColor: skill.color },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/dacsanvietLogo.webp')}
            style={styles.avatar}
            resizeMode="contain"
          />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          <Text style={styles.title}>{personalInfo.occupation}</Text>
          <Text style={styles.subtitle}>{personalInfo.school}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#3498db' }]}>
              <FontAwesome name="user" size={16} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ và tên:</Text>
            <Text style={styles.value}>{personalInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tuổi:</Text>
            <Text style={styles.value}>{personalInfo.age} tuổi</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nghề nghiệp:</Text>
            <Text style={styles.value}>{personalInfo.occupation}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trường:</Text>
            <Text style={styles.value}>{personalInfo.school}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chuyên ngành:</Text>
            <Text style={styles.value}>{personalInfo.major}</Text>
          </View>
        </View>

        {/* Hobbies */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
              <FontAwesome name="heart" size={16} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Sở thích</Text>
          </View>
          
          {hobbies.map((hobby: string, index: number) => (
            <View key={index} style={styles.hobbyItem}>
              <Ionicons name="checkmark-circle" size={16} color="#3498db" />
              <Text style={styles.hobbyText}>{hobby}</Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#9b59b6' }]}>
              <MaterialIcons name="code" size={18} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Kỹ năng lập trình</Text>
          </View>
          
          {skills.map((skill: Skill, index: number) => (
            <SkillBar key={index} skill={skill} />
          ))}
        </View>

        {/* Goals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
              <FontAwesome name="bullseye" size={16} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Mục tiêu</Text>
          </View>
          
          {[
            'Trở thành Mobile Developer chuyên nghiệp',
            'Phát triển ứng dụng hữu ích cho cộng đồng',
            'Học hỏi và chia sẻ kiến thức',
            'Tham gia các dự án mã nguồn mở',
          ].map((goal: string, index: number) => (
            <View key={index} style={styles.hobbyItem}>
              <Ionicons name="arrow-forward-circle" size={16} color="#27ae60" />
              <Text style={styles.hobbyText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#2ecc71',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 100,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    fontWeight: '500',
  },
  hobbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
    marginLeft: 8,
  },
  skillContainer: {
    marginBottom: 15,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  skillPercent: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  skillBarBackground: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default HomepageScreen;