import { Metadata } from 'next';
import AddMedicationForm from '@/components/medications/AddMedicationForm';

export const metadata: Metadata = {
  title: 'إضافة دواء | Add Medication - صِحتنا',
  description: 'Add new medications to your family health profile. Configure safe dosages, fixed times, intervals, and meal reminders. إضافة دواء جديد وضبط المواعيد.',
};

import AddMedicationContent from '@/components/medications/AddMedicationContent';

export default function AddMedicationPage() {
  return <AddMedicationContent />;
}
