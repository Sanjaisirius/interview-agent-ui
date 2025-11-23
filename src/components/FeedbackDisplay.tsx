import { useEffect, useState } from 'react';
import { CheckCircle, TrendingUp, AlertCircle, Home } from 'lucide-react';
import { getFeedback } from '../services/interviewService';
import { InterviewFeedback } from '../lib/supabase';

interface FeedbackDisplayProps {
  sessionId: string;
  onStartNew: () => void;
}

export function FeedbackDisplay({ sessionId, onStartNew }: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, [sessionId]);

  const loadFeedback = async () => {
    try {
      const data = await getFeedback(sessionId);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Analyzing your interview...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No feedback available</p>
          <button
            onClick={onStartNew}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-blue-100';
    if (score >= 4) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Interview Complete!
          </h1>
          <p className="text-slate-600">Here's your performance feedback</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Overall Score</p>
              <div className={`text-5xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                {feedback.overall_score}
                <span className="text-2xl text-slate-400">/10</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Communication</p>
              <div className={`text-5xl font-bold ${getScoreColor(feedback.communication_score)}`}>
                {feedback.communication_score}
                <span className="text-2xl text-slate-400">/10</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Technical</p>
              <div className={`text-5xl font-bold ${getScoreColor(feedback.technical_score)}`}>
                {feedback.technical_score}
                <span className="text-2xl text-slate-400">/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Strengths</h3>
                <div className="space-y-2">
                  {feedback.strengths.split(';').map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{strength.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Areas for Improvement</h3>
                <div className="space-y-2">
                  {feedback.areas_for_improvement.split(';').map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{improvement.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Detailed Feedback</h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {feedback.detailed_feedback}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartNew}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Start New Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
