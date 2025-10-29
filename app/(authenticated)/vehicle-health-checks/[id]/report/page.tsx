'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { VHC_VALUE_MAPPING } from '@/lib/vhc/answerMapping';
import {
  Download,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface VHCResponse {
  id: string;
  templateId: string;
  templateVersion: number;
  powertrain: string;
  status: string;
  vehicleId: string;
  answers: Array<{
    itemId: string;
    value: number;
    notes?: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  scores: {
    section: Record<string, number>;
    total: number;
  };
  progress: {
    answered: number;
    total: number;
  };
}

interface VHCTemplate {
  id: string;
  version: number;
  title: string;
  sections: Array<{
    id: string;
    title: string;
    weight: number;
    applicable_to?: string[];
    items: Array<{
      id: string;
      label: string;
      weight: number;
    }>;
  }>;
}

export default function VHCReportPage() {
  const params = useParams();
  const router = useRouter();
  const [response, setResponse] = useState<VHCResponse | null>(null);
  const [template, setTemplate] = useState<VHCTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch VHC response
        const resp = await fetchWithAuth(`/api/vhc/responses/${params.id}`);
        if (!resp.ok) {
          throw new Error('Failed to fetch VHC response');
        }
        const responseData = await resp.json();
        setResponse(responseData);

        // Fetch VHC template
        const tpl = await fetchWithAuth(
          `/api/vhc/templates/${responseData.templateId}`,
        );
        if (!tpl.ok) {
          throw new Error('Failed to fetch VHC template');
        }
        const templateData = await tpl.json();
        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 0.6)
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Poor';
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF generation and download
    console.log('Download report functionality to be implemented');
  };

  const handleEmailReport = () => {
    // TODO: Implement email functionality
    console.log('Email report functionality to be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !response || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Report
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => router.push('/vehicle-health-checks')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to VHC List
          </button>
        </div>
      </div>
    );
  }

  const totalScore = response.scores.total;
  const scorePercentage = Math.round(totalScore * 100);

  // Filter sections based on vehicle powertrain
  const applicableSections = template.sections.filter(
    (section) =>
      !section.applicable_to ||
      section.applicable_to.includes(response.powertrain),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/vehicle-health-checks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to VHC List
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Health Check Report
            </h1>
            <p className="text-gray-600">Vehicle ID: {response.vehicleId}</p>
            <p className="text-sm text-gray-500">
              Completed on {new Date(response.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {getScoreIcon(totalScore)}
              <h2 className="text-2xl font-semibold text-gray-900">
                Overall Score
              </h2>
            </div>
            <div className="text-6xl font-bold mb-2">
              <span className={getScoreColor(totalScore)}>
                {scorePercentage}%
              </span>
            </div>
            <p className={`text-lg font-medium ${getScoreColor(totalScore)}`}>
              {getScoreLabel(totalScore)} Condition
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalScore >= 0.8
                    ? 'bg-green-500'
                    : totalScore >= 0.6
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Section Scores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Section Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicableSections.map((section) => {
              const sectionScore = response.scores.section[section.id] || 0;
              const sectionPercentage = Math.round(sectionScore * 100);
              const sectionAnswers = response.answers.filter((answer) =>
                section.items.some((item) => item.id === answer.itemId),
              );

              return (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(sectionScore)}
                      <span
                        className={`font-semibold ${getScoreColor(
                          sectionScore,
                        )}`}
                      >
                        {sectionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        sectionScore >= 0.8
                          ? 'bg-green-500'
                          : sectionScore >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${sectionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {sectionAnswers.length} of {section.items.length} items
                    assessed
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Detailed Results
          </h3>
          <div className="space-y-4">
            {applicableSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 mb-3">
                  {section.title}
                </h4>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const answer = response.answers.find(
                      (a) => a.itemId === item.id,
                    );
                    const value = answer?.value;
                    const title = value
                      ? VHC_VALUE_MAPPING[
                          value as keyof typeof VHC_VALUE_MAPPING
                        ]
                      : 'Not assessed';

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            value
                              ? value >= 4
                                ? 'text-green-600'
                                : value >= 3
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p>Vehicle Health Check System v{template.version}</p>
        </div>
      </div>
    </div>
  );
}
