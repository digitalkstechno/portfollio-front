import { useState, useCallback } from 'react';
import axios from 'axios';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (url: string, config?: any) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<T>(url, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMsg);
        options?.onError?.(err);
        console.error('API Error:', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { data, isLoading, error, request };
}

export function useApiPost<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (url: string, payload: any, config?: any) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.post<T>(url, payload, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMsg);
        options?.onError?.(err);
        console.error('API Error:', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { data, isLoading, error, request };
}
