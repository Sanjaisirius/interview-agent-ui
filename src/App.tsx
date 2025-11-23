import { useState } from 'react';
import { RoleSelector } from './components/RoleSelector';
import { InterviewSession } from './components/InterviewSession';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { createInterviewSession } from './services/interviewService';

type AppState = 'role-selection' | 'interview' | 'feedback';

function App() {
  const [appState, setAppState] = useState<AppState>('role-selection');
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleSelect = async (role: string) => {
    try {
      const newSessionId = await createInterviewSession(role);
      setSessionId(newSessionId);
      setSelectedRole(role);
      setAppState('interview');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleInterviewComplete = () => {
    setAppState('feedback');
  };

  const handleStartNew = () => {
    setAppState('role-selection');
    setSessionId('');
    setSelectedRole('');
  };

  const handleCancelInterview = () => {
    setAppState('role-selection');
    setSessionId('');
    setSelectedRole('');
  };

  return (
    <>
      {appState === 'role-selection' && (
        <RoleSelector onSelectRole={handleRoleSelect} />
      )}
      {appState === 'interview' && (
        <InterviewSession
          sessionId={sessionId}
          role={selectedRole}
          onComplete={handleInterviewComplete}
          onCancel={handleCancelInterview}
        />
      )}
      {appState === 'feedback' && (
        <FeedbackDisplay sessionId={sessionId} onStartNew={handleStartNew} />
      )}
    </>
  );
}

export default App;
