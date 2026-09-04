import { AlertTriangle } from 'lucide-react';
import type { Anomaly } from '../utils/analysis';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
}

export const AnomalyAlerts = ({ anomalies }: AnomalyAlertsProps) => {
  if (anomalies.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-800 font-medium">
            Harika! Bu ay tüm fakülteler normal tüketim seviyelerinde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Anomali Uyarıları</h2>
      {anomalies.map((anomaly, index) => (
        <div
          key={index}
          className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-red-900 font-semibold text-lg mb-1">
                DİKKAT: {anomaly.facultyName}
              </p>
              <p className="text-red-700">
                Bu ay <span className="font-bold">{anomaly.facultyName}</span>, normalden{' '}
                <span className="font-bold">%{anomaly.percentageOver}</span> daha fazla{' '}
                <span className="font-bold">{anomaly.resourceType}</span> tüketiyor. Lütfen tesisatı kontrol edin!
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function Leaf(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
