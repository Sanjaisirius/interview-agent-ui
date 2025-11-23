import { supabase } from '../lib/supabase';

export interface RoleConfig {
  name: string;
  description: string;
  initialQuestions: string[];
  focusAreas: string[];
}

export const ROLES: Record<string, RoleConfig> = {
  sales: {
    name: 'Sales Representative',
    description: 'Customer-facing sales position',
    initialQuestions: [
      "Tell me about yourself and your sales experience.",
      "How do you handle rejection from potential customers?",
      "Describe a time when you exceeded your sales targets.",
      "How would you approach a cold call to a potential client?",
      "What motivates you in a sales role?"
    ],
    focusAreas: ['persuasion', 'resilience', 'communication', 'goal orientation']
  },
  engineer: {
    name: 'Software Engineer',
    description: 'Technical development position',
    initialQuestions: [
      "Tell me about your background in software engineering.",
      "How do you approach debugging a complex issue in production?",
      "Describe a challenging technical problem you solved recently.",
      "How do you stay current with new technologies and best practices?",
      "Tell me about a time you had to make a trade-off between speed and quality."
    ],
    focusAreas: ['problem-solving', 'technical knowledge', 'collaboration', 'continuous learning']
  },
  retail: {
    name: 'Retail Associate',
    description: 'Customer service and sales position',
    initialQuestions: [
      "Tell me about your experience in customer service or retail.",
      "How would you handle an upset customer?",
      "Describe a time when you went above and beyond for a customer.",
      "How do you prioritize tasks during a busy shift?",
      "What does excellent customer service mean to you?"
    ],
    focusAreas: ['customer service', 'patience', 'multitasking', 'teamwork']
  }
};

export async function createInterviewSession(role: string): Promise<string> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({ role, status: 'in_progress' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data!.id;
}

export async function saveExchange(
  sessionId: string,
  question: string,
  response: string,
  sequenceNumber: number
): Promise<void> {
  const { error } = await supabase
    .from('interview_exchanges')
    .insert({
      session_id: sessionId,
      question,
      response,
      sequence_number: sequenceNumber
    });

  if (error) throw error;
}

export async function completeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('interview_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
}

export function generateFollowUpQuestion(
  role: string,
  previousQuestion: string,
  userResponse: string,
  questionNumber: number
): string {
  const roleConfig = ROLES[role];

  if (questionNumber === 0) {
    return roleConfig.initialQuestions[0];
  }

  const responseLength = userResponse.split(' ').length;
  const containsExample = userResponse.toLowerCase().includes('example') ||
                          userResponse.toLowerCase().includes('time when') ||
                          userResponse.toLowerCase().includes('instance');

  if (responseLength < 20 && questionNumber < 3) {
    return "Can you elaborate more on that? I'd like to hear more details.";
  }

  if (!containsExample && questionNumber < 4 &&
      (previousQuestion.includes('Tell me about') || previousQuestion.includes('Describe'))) {
    return "That's interesting. Can you give me a specific example of when this happened?";
  }

  if (questionNumber < roleConfig.initialQuestions.length) {
    return roleConfig.initialQuestions[questionNumber];
  }

  const followUps: Record<string, string[]> = {
    sales: [
      "How do you qualify leads before investing time in them?",
      "What's your approach to building long-term customer relationships?",
      "How do you handle price objections?",
      "Tell me about your experience with CRM systems.",
      "How do you prepare for important sales presentations?"
    ],
    engineer: [
      "How do you approach code reviews?",
      "What's your experience with testing and quality assurance?",
      "How do you handle technical debt in a project?",
      "Tell me about your experience working in an agile environment.",
      "How do you approach system design for scalability?"
    ],
    retail: [
      "How do you handle multiple customers waiting for assistance?",
      "Tell me about your experience with cash handling or POS systems.",
      "How do you approach upselling or cross-selling?",
      "What would you do if you noticed a coworker providing poor service?",
      "How do you maintain energy and positivity during long shifts?"
    ]
  };

  const additionalQuestions = followUps[role] || [];
  const adjustedIndex = questionNumber - roleConfig.initialQuestions.length;

  if (adjustedIndex < additionalQuestions.length) {
    return additionalQuestions[adjustedIndex];
  }

  return "Thank you for your responses. Is there anything else you'd like to add about your qualifications for this role?";
}

export async function generateFeedback(sessionId: string, role: string): Promise<void> {
  const { data: exchanges, error } = await supabase
    .from('interview_exchanges')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true });

  if (error) throw error;

  const feedback = analyzeFeedback(exchanges || [], role);

  const { error: insertError } = await supabase
    .from('interview_feedback')
    .insert({
      session_id: sessionId,
      ...feedback
    });

  if (insertError) throw insertError;
}

function analyzeFeedback(exchanges: any[], role: string) {
  const roleConfig = ROLES[role];
  let communicationScore = 5;
  let technicalScore = 5;
  const strengths: string[] = [];
  const improvements: string[] = [];

  exchanges.forEach((exchange) => {
    const response = exchange.response.toLowerCase();
    const wordCount = exchange.response.split(' ').length;

    if (wordCount > 50) {
      communicationScore = Math.min(10, communicationScore + 1);
      if (strengths.length < 3) strengths.push('Provides detailed responses');
    } else if (wordCount < 15) {
      communicationScore = Math.max(1, communicationScore - 1);
      if (!improvements.includes('Provide more detailed answers with specific examples')) {
        improvements.push('Provide more detailed answers with specific examples');
      }
    }

    if (response.includes('example') || response.includes('instance') ||
        response.includes('time when') || response.includes('situation')) {
      technicalScore = Math.min(10, technicalScore + 1);
      if (!strengths.includes('Uses specific examples to support answers') && strengths.length < 3) {
        strengths.push('Uses specific examples to support answers');
      }
    }

    if (response.includes('team') || response.includes('collaborate') ||
        response.includes('together')) {
      if (!strengths.includes('Demonstrates teamwork and collaboration') && strengths.length < 3) {
        strengths.push('Demonstrates teamwork and collaboration');
      }
    }

    if (response.includes('learned') || response.includes('improved') ||
        response.includes('developed')) {
      if (!strengths.includes('Shows growth mindset and adaptability') && strengths.length < 3) {
        strengths.push('Shows growth mindset and adaptability');
      }
    }
  });

  if (exchanges.length < 5) {
    improvements.push('Practice answering more questions to build confidence');
  }

  if (improvements.length === 0) {
    improvements.push('Continue practicing with different scenarios');
  }

  const overallScore = Math.round((communicationScore + technicalScore) / 2);

  const detailedFeedback = `
Interview Performance Summary for ${roleConfig.name}:

You answered ${exchanges.length} questions during this mock interview. Your responses demonstrate ${overallScore >= 7 ? 'strong' : overallScore >= 5 ? 'solid' : 'developing'} interview skills.

Communication (${communicationScore}/10): ${communicationScore >= 7 ? 'You communicate clearly and provide comprehensive answers.' : communicationScore >= 5 ? 'Your communication is adequate but could be more detailed.' : 'Focus on providing more structured and detailed responses.'}

Technical Knowledge (${technicalScore}/10): ${technicalScore >= 7 ? 'You demonstrate strong relevant knowledge with concrete examples.' : technicalScore >= 5 ? 'You show basic understanding but could provide more specific examples.' : 'Work on incorporating more specific examples and demonstrating deeper knowledge.'}

Key Areas Assessed: ${roleConfig.focusAreas.join(', ')}

Keep practicing to refine your interview skills!
  `.trim();

  return {
    overall_score: overallScore,
    communication_score: communicationScore,
    technical_score: technicalScore,
    strengths: strengths.join('; '),
    areas_for_improvement: improvements.join('; '),
    detailed_feedback: detailedFeedback
  };
}

export async function getFeedback(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_feedback')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
