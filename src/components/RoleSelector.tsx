import { Briefcase, Code, ShoppingBag } from 'lucide-react';
import { ROLES } from '../services/interviewService';

interface RoleSelectorProps {
  onSelectRole: (role: string) => void;
}

const roleIcons: Record<string, any> = {
  sales: Briefcase,
  engineer: Code,
  retail: ShoppingBag
};

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Interview Practice Partner
          </h1>
          <p className="text-xl text-slate-600">
            Prepare for your next interview with AI-powered mock interviews
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(ROLES).map(([key, role]) => {
            const Icon = roleIcons[key];
            return (
              <button
                key={key}
                onClick={() => onSelectRole(key)}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {role.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {role.focusAreas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <p>Select your target role and begin the mock interview</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <p>Answer questions using voice or text with natural conversation flow</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <p>Receive detailed feedback on your performance and areas to improve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
