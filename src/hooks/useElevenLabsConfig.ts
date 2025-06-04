
import { useState, useEffect } from 'react';
import { getElevenLabsConfig, type ElevenLabsConfig } from '@/utils/elevenLabsConfig';
import { useAuth } from '@/components/AuthProvider';

export const useElevenLabsConfig = () => {
  const [config, setConfig] = useState<ElevenLabsConfig>({ 
    apiKey: null, 
    isConfigured: false 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConfig = async () => {
    if (!user) {
      setConfig({ apiKey: null, isConfigured: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configData = await getElevenLabsConfig();
      setConfig(configData);
    } catch (err) {
      console.error('Error fetching ElevenLabs config:', err);
      setError('Failed to fetch ElevenLabs configuration');
      setConfig({ apiKey: null, isConfigured: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig
  };
};
