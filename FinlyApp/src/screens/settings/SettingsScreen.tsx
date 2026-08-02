import { ScrollView } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { t } from '../../i18n';
import type { IconName } from '../../components/IconGrid';
import SettingsRow from '../../components/settings/SettingsRow';
import { settingsStyles } from '../../components/settings/settingsStyles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../constants/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

type Subsection = {
  icon: IconName;
  label: string;
  screen: 'SettingsAppearance' | 'SettingsRegional' | 'SettingsPersonalization' | 'SettingsData';
};

export default function SettingsScreen({ navigation }: Props) {
  const { activeColors: c } = useConfig();
  const labels = t();

  const subsections: Subsection[] = [
    { icon: 'color-palette-outline', label: labels.settings_appearance, screen: 'SettingsAppearance' },
    { icon: 'globe-outline', label: labels.settings_regional, screen: 'SettingsRegional' },
    { icon: 'options-outline', label: labels.settings_personalization, screen: 'SettingsPersonalization' },
    { icon: 'server-outline', label: labels.settings_data, screen: 'SettingsData' },
  ];

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      {subsections.map((item) => (
        <SettingsRow
          key={item.screen}
          icon={item.icon}
          label={item.label}
          onPress={() => navigation.navigate(item.screen)}
        />
      ))}
    </ScrollView>
  );
}
