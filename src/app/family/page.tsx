import { Metadata } from 'next';
import FamilyList from '@/components/family/FamilyList';

export const metadata: Metadata = {
  title: 'ملفات العائلة | Family Profiles - صِحتنا',
  description: 'Manage health profiles for your loved ones. Track medications for elderly parents and children safely. رعاية صحة العائلة ومتابعة الأدوية.',
};

import FamilyContent from '@/components/family/FamilyContent';

export default function FamilyPage() {
  return <FamilyContent />;
}
