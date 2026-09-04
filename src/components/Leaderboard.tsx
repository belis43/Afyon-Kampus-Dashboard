import { Trophy, Award, Medal } from 'lucide-react';
import type { GreenScore } from '../utils/analysis';

interface LeaderboardProps {
  scores: GreenScore[];
}

export const Leaderboard = ({ scores }: LeaderboardProps) => {
  const topThree = scores.slice(0, 3);
  const icons = [Trophy, Award, Medal];
  const colors = [
    { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', icon: 'text-yellow-500' },
    { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-700', icon: 'text-gray-500' },
    { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', icon: 'text-orange-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Yeşil Bina Liderlik Tablosu</h2>
        <p className="text-gray-600">En çevreci fakültelerimiz - Tebrikler!</p>
      </div>

      <div className="space-y-4">
        {topThree.map((score, index) => {
          const Icon = icons[index];
          const colorScheme = colors[index];

          return (
            <div
              key={index}
              className={`${colorScheme.bg} border-2 ${colorScheme.border} rounded-lg p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`p-3 bg-white rounded-full shadow-md`}>
                      <Icon className={`w-7 h-7 ${colorScheme.icon}`} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${colorScheme.text}`}>
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {score.facultyName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Tasarruf Oranı: <span className="font-semibold">{score.savingsRate > 0 ? '+' : ''}{score.savingsRate.toLocaleString('tr-TR')}%</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${colorScheme.text}`}>
                    {score.score}
                  </div>
                  <div className="text-sm text-gray-600">Yeşil Puan</div>
                </div>
              </div>

              <div className="mt-3 bg-white rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colorScheme.border.replace('border-', 'bg-')} transition-all duration-500`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {scores.length > 3 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Diğer Fakülteler</h3>
          <div className="space-y-2">
            {scores.slice(3).map((score, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-500 w-6">
                    #{index + 4}
                  </span>
                  <span className="text-sm text-gray-700">{score.facultyName}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{score.score} puan</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};