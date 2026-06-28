import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index',    title: 'Home',     icon: 'home-outline',         activeIcon: 'home' },
  { name: 'messages', title: 'Messages', icon: 'chatbubble-outline',    activeIcon: 'chatbubble' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar-outline',      activeIcon: 'calendar' },
  { name: 'expenses', title: 'Expenses', icon: 'cash-outline',          activeIcon: 'cash' },
  { name: 'coach',    title: 'Coach', icon: 'bulb-outline',          activeIcon: 'bulb' },
  { name: 'more',     title: 'More',     icon: 'grid-outline',          activeIcon: 'grid' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#568960',
        tabBarInactiveTintColor: '#c8c0b8',
        tabBarStyle: {
          borderTopColor: '#e8e0d8',
          backgroundColor: '#ffffff',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarItemStyle: { borderRadius: 12 },
        headerShown: false,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? t.activeIcon : t.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
