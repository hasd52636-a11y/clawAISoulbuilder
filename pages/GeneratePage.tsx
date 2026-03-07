import React, { useState, useEffect } from 'react';
import { Download, Zap, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import CelebritySoulsGrid from '../components/CelebritySoulsGrid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface GeneratedConfig {
  agentId: string;
  soulId: string;
  agentName: string;
  files: Record<string, string>;
  generatedAt: string;
  status: string;
}

interface Soul {
  id: string;
  name: string;
  nameZh: string;
  archetype: string;
  description: string;
}

export default function GeneratePage() {
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
  const [agentName, setAgentName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [loadingSouls, setLoadingSouls] = useState(true);

  // Load available souls on mount
  useEffect(() => {
    const fetchSouls = async () => {
      try {
        const response = await fetch('/api/v1/souls');
        const data = await response.json();
        if (data.success) {
          setSouls(data.data);
        }
      } catch (err) {
        console.error('Failed to load souls:', err);
      } finally {
        setLoadingSouls(false);
      }
    };
    fetchSouls();
  }, []);

  const handleSoulSelect = (soul: Soul) => {
    setSelectedSoul(soul);
    setAgentName(soul.name);
    setError('');
    setSuccess('');
  };

  const validateApiKey = async () => {
    if (!apiKey) {
      setError('Please enter an API key');
      return false;
    }

    try {
      const response = await fetch('/api/v1/keys/validate', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
      });
      const data = await response.json();
      if (!data.valid) {
        setError('Invalid API key');
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to validate API key');
      return false;
    }
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');

    if (!selectedSoul) {
      setError('Please select a celebrity soul');
      return;
    }

    if (!agentName.trim()) {
      setError('Please enter an agent name');
      return;
    }

    const isValidKey = await validateApiKey();
    if (!isValidKey) return;

    setLoading(true);

    try {
      const response = await fetch('/api/v1/agents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          soulId: selectedSoul.id,
          agentName: agentName.trim(),
          customizations: {},
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to generate configuration');
        return;
      }

      setGeneratedConfig(data.data);
      setSuccess(`Agent "${agentName}" generated successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate agent configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedConfig) return;

    try {
      const zip = new JSZip();
      const agentFolder = zip.folder(agentName);

      if (agentFolder) {
        Object.entries(generatedConfig.files).forEach(([filename, content]) => {
          agentFolder.file(filename, content as string);
        });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${agentName}-config.zip`);
      setSuccess('Configuration downloaded successfully!');
    } catch (err) {
      setError('Failed to download configuration');
    }
  };

  const handleDeploy = async () => {
    if (!generatedConfig) return;

    try {
      setLoading(true);
      // In production, this would deploy to OpenClaw
      // For now, we'll just show a success message
      setSuccess('Configuration ready for deployment to OpenClaw!');
    } catch (err) {
      setError('Failed to deploy configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 ClawNexus Agent Generator
          </h1>
          <p className="text-slate-400">
            Generate OpenClaw agents powered by celebrity digital souls
          </p>
        </div>

        {/* API Key Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">API Configuration</h2>
          <input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-sm text-slate-400 mt-2">
            Demo key: <code className="bg-slate-700 px-2 py-1 rounded">demo-key-123</code>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Soul Selection */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                Select Celebrity Soul
              </h2>
              {loadingSouls ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : (
                <CelebritySoulsGrid
                  onSoulSelect={handleSoulSelect}
                  selectedSoulId={selectedSoul?.id}
                />
              )}
            </div>
          </div>

          {/* Right: Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>

              {/* Selected Soul Info */}
              {selectedSoul && (
                <div className="mb-6 p-4 bg-slate-700 rounded border border-slate-600">
                  <p className="text-sm text-slate-400">Selected Soul</p>
                  <p className="text-white font-semibold">{selectedSoul.name}</p>
                  <p className="text-sm text-slate-400">{selectedSoul.archetype}</p>
                </div>
              )}

              {/* Agent Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !selectedSoul}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded font-medium flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate Agent'}
                </button>

                {generatedConfig && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download Config
                    </button>

                    <button
                      onClick={handleDeploy}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Zap className="w-4 h-4" />
                      {loading ? 'Deploying...' : 'Deploy to OpenClaw'}
                    </button>
                  </>
                )}
              </div>

              {/* Generated Config Info */}
              {generatedConfig && (
                <div className="mt-6 p-4 bg-slate-700 rounded border border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">Generated Configuration</p>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p>
                      <span className="text-slate-400">Agent ID:</span>{' '}
                      <code className="bg-slate-800 px-1 rounded">
                        {generatedConfig.agentId}
                      </code>
                    </p>
                    <p>
                      <span className="text-slate-400">Status:</span>{' '}
                      <span className="text-green-400">{generatedConfig.status}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Files:</span>{' '}
                      {Object.keys(generatedConfig.files).length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
