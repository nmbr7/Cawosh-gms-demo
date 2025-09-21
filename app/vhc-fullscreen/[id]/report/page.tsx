"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { VHC_VALUE_MAPPING } from "@/lib/vhc/answerMapping";
import {
  Download,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

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

export default function VHCReportFullscreenPage() {
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
          throw new Error("Failed to fetch VHC response");
        }
        const responseData = await resp.json();
        setResponse(responseData);

        // Fetch VHC template
        const tpl = await fetchWithAuth(
          `/api/vhc/templates/${responseData.templateId}`
        );
        if (!tpl.ok) {
          throw new Error("Failed to fetch VHC template");
        }
        const templateData = await tpl.json();
        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 0.6)
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Good";
    if (score >= 0.6) return "Fair";
    return "Poor";
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF generation and download
    console.log("Download report functionality to be implemented");
  };

  const handleEmailReport = () => {
    // TODO: Implement email functionality
    console.log("Email report functionality to be implemented");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !response || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Report
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            {error || "Report not found"}
          </p>
          <button
            onClick={() => router.push("/vehicle-health-checks")}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg"
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
      section.applicable_to.includes(response.powertrain)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/vehicle-health-checks")}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to VHC List
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Vehicle Health Check Report
            </h1>
            <p className="text-gray-600 text-xl">
              Vehicle ID: {response.vehicleId}
            </p>
            <p className="text-gray-500 text-lg">
              Completed on {new Date(response.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              {getScoreIcon(totalScore)}
              <h2 className="text-3xl font-semibold text-gray-900">
                Overall Score
              </h2>
            </div>
            <div className="text-8xl font-bold mb-4">
              <span className={getScoreColor(totalScore)}>
                {scorePercentage}%
              </span>
            </div>
            <p
              className={`text-2xl font-medium ${getScoreColor(
                totalScore
              )} mb-6`}
            >
              {getScoreLabel(totalScore)} Condition
            </p>
            <div className="mt-6 w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  totalScore >= 0.8
                    ? "bg-green-500"
                    : totalScore >= 0.6
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Section Scores */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Section Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicableSections.map((section) => {
              const sectionScore = response.scores.section[section.id] || 0;
              const sectionPercentage = Math.round(sectionScore * 100);
              const sectionAnswers = response.answers.filter((answer) =>
                section.items.some((item) => item.id === answer.itemId)
              );

              return (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      {getScoreIcon(sectionScore)}
                      <span
                        className={`font-bold text-xl ${getScoreColor(
                          sectionScore
                        )}`}
                      >
                        {sectionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        sectionScore >= 0.8
                          ? "bg-green-500"
                          : sectionScore >= 0.6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${sectionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600">
                    {sectionAnswers.length} of {section.items.length} items
                    assessed
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Detailed Results
          </h3>
          <div className="space-y-6">
            {applicableSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-xl p-6"
              >
                <h4 className="font-semibold text-gray-900 mb-4 text-xl">
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const answer = response.answers.find(
                      (a) => a.itemId === item.id
                    );
                    const value = answer?.value;
                    const title = value
                      ? VHC_VALUE_MAPPING[
                          value as keyof typeof VHC_VALUE_MAPPING
                        ]
                      : "Not assessed";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-gray-700 text-lg">
                          {item.label}
                        </span>
                        <span
                          className={`font-semibold text-lg ${
                            value
                              ? value >= 4
                                ? "text-green-600"
                                : value >= 3
                                ? "text-yellow-600"
                                : "text-red-600"
                              : "text-gray-400"
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
        <div className="text-center mt-12 text-gray-500 text-lg">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p>Vehicle Health Check System v{template.version}</p>
        </div>
      </div>
    </div>
  );
}
