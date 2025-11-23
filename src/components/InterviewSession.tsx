import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, X } from 'lucide-react';
import { speechService } from '../services/speechService';
import {
  generateFollowUpQuestion,
  saveExchange,
  completeSession,
  generateFeedback,
  ROLES
} from '../services/interviewService';

interface InterviewSessionProps {
  sessionId: string;
  role: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface Message {
  type: 'question' | 'answer';
  text: string;
  timestamp: Date;
}

export function InterviewSession({ sessionId, role, onComplete, onCancel }: InterviewSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxQuestions = 8;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = async () => {
    const firstQuestion = generateFollowUpQuestion(role, '', '', 0);
    const questionMsg: Message = {
      type: 'question',
      text: firstQuestion,
      timestamp: new Date()
    };
    setMessages([questionMsg]);

    if (voiceEnabled && speechService.isSupported()) {
      await speakQuestion(firstQuestion);
    }
  };

  const speakQuestion = async (text: string) => {
    try {
      setIsSpeaking(true);
      await speechService.speak(text);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const transcript = await speechService.listen();
      setIsListening(false);
      setCurrentInput(transcript);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentInput.trim() || isProcessing) return;

    setIsProcessing(true);
    const answer = currentInput.trim();
    setCurrentInput('');

    const answerMsg: Message = {
      type: 'answer',
      text: answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, answerMsg]);

    const lastQuestion = messages[messages.length - 1]?.text || '';

    try {
      await saveExchange(sessionId, lastQuestion, answer, questionCount);

      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      if (newQuestionCount >= maxQuestions) {
        await finishInterview();
        return;
      }

      const nextQuestion = generateFollowUpQuestion(role, lastQuestion, answer, newQuestionCount);

      const questionMsg: Message = {
        type: 'question',
        text: nextQuestion,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, questionMsg]);

      if (voiceEnabled && speechService.isSupported()) {
        await speakQuestion(nextQuestion);
      }
    } catch (error) {
      console.error('Error processing answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finishInterview = async () => {
    setIsProcessing(true);
    const finalMsg: Message = {
      type: 'question',
      text: "Thank you for completing the interview! I'm now analyzing your responses to provide feedback...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, finalMsg]);

    if (voiceEnabled && speechService.isSupported()) {
      await speakQuestion(finalMsg.text);
    }

    try {
      await completeSession(sessionId);
      await generateFeedback(sessionId, role);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error completing interview:', error);
      setIsProcessing(false);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      speechService.stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const roleConfig = ROLES[role];
  const progress = Math.min((questionCount / maxQuestions) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {roleConfig.name} Interview
              </h2>
              <p className="text-sm text-slate-600">
                Question {questionCount} of {maxQuestions}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={onCancel}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                title="Cancel interview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 shadow-sm ${
                  message.type === 'question'
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.type === 'question' ? 'text-slate-500' : 'text-blue-100'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-600 rounded-2xl px-6 py-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <p className="text-sm">Speaking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                rows={3}
                disabled={isProcessing || questionCount >= maxQuestions}
              />
            </div>
            <div className="flex flex-col gap-2">
              {speechService.isSupported() && (
                <button
                  onClick={handleVoiceInput}
                  disabled={isProcessing || questionCount >= maxQuestions}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentInput.trim() || isProcessing || questionCount >= maxQuestions}
                className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send answer"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          {speechService.isSupported() && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Use voice input or type your responses
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
