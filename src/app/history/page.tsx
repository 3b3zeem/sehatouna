import { Metadata } from 'next';
import HistoryLog from '@/components/history/HistoryLog';

export const metadata: Metadata = {
  title: 'سجل المتابعة | History Log - صِحتنا',
  description: 'Track medication adherence history to prevent health relapses. Monitor weekly compliance percentages. كيف يساعد تتبع الالتزام بالعلاج في تجنب الانتكاسات.',
};

import HistoryContent from '@/components/history/HistoryContent';

export default function HistoryPage() {
  return <HistoryContent />;
}
