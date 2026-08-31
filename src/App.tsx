import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { DepartmentType, ApplicationRecord } from './types';
import { CosmicCartoonBackground } from './components/CosmicCartoonBackground';
import { CosmicEffectOverlay } from './components/CosmicEffectOverlay';
import { Header } from './components/Header';
import { CartoonGoogleForm } from './components/CartoonGoogleForm';
import { DepartmentCards } from './components/DepartmentCards';
import { ApplicantsSpaceStation } from './components/ApplicantsSpaceStation';
import { CosmicSuccessModal } from './components/CosmicSuccessModal';
import { CartoonMascotWidget } from './components/CartoonMascotWidget';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'departments' | 'applicants'>('form');
  const [selectedDeptForApply, setSelectedDeptForApply] = useState<DepartmentType>('chuyen-mon');
  const [submittedRecord, setSubmittedRecord] = useState<ApplicationRecord | null>(null);
  const [applicantsCount, setApplicantsCount] = useState<number>(0);

  useEffect(() => {
    // Listen for total applicants count from Firestore in real-time
    const unsubscribe = onSnapshot(
      collection(db, 'applications'),
      (snapshot) => {
        setApplicantsCount(snapshot.size);
      },
      (err) => {
        console.error('Firestore count listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSelectDeptForApply = (deptId: DepartmentType) => {
    setSelectedDeptForApply(deptId);
    setActiveTab('form');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSuccessSubmitted = (record: ApplicationRecord) => {
    setSubmittedRecord(record);
  };

  return (
    <div className="min-h-screen bg-[#1e1b4b] text-slate-100 font-sans selection:bg-amber-300 selection:text-amber-950 relative overflow-x-hidden">
      
      {/* Cartoon Space Background with Planets, Stars & Clickable Bubbles */}
      <CosmicCartoonBackground />

      {/* Global Interactive Particle Effects (Click Explosion & Cursor Stardust Trail) */}
      <CosmicEffectOverlay />

      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicantsCount={applicantsCount}
      />

      {/* Main Content View */}
      <main className="relative z-10 min-h-[calc(100vh-180px)]">
        {activeTab === 'form' && (
          <CartoonGoogleForm
            initialDepartment={selectedDeptForApply}
            onSuccessSubmitted={handleSuccessSubmitted}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentCards
            onSelectDepartmentForApply={handleSelectDeptForApply}
          />
        )}

        {activeTab === 'applicants' && (
          <ApplicantsSpaceStation />
        )}
      </main>

      {/* Cosmic Success & Gemini AI Evaluation Modal */}
      {submittedRecord && (
        <CosmicSuccessModal
          record={submittedRecord}
          onClose={() => setSubmittedRecord(null)}
          onViewApplicants={() => {
            setSubmittedRecord(null);
            setActiveTab('applicants');
          }}
        />
      )}

      {/* Cartoon Floating Mascot Pico Widget */}
      <CartoonMascotWidget />

      {/* Footer */}
      <Footer />

    </div>
  );
}
