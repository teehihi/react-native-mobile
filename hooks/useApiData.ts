import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching data from API with loading and error states
 * @template T - The type of data being fetched
 * @param fetchFunction - Async function that fetches the data
 * @param dependencies - Array of dependencies that trigger refetch when changed
 * @returns Object containing data, loading state, error state, and retry function
 */
export function useApiData<T>(
  fetchFunction: () => Promise<{ success: boolean; data?: T; message?: string }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction();
      
      if (response.success && response.data !== undefined) {
        setData(response.data);
      } else {
        setError(response.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Lỗi kết nối mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry };
}

/**
 * Hook for fetching data with manual trigger (doesn't auto-fetch on mount)
 * @template T - The type of data being fetched
 * @param fetchFunction - Async function that fetches the data
 * @returns Object containing data, loading state, error state, and fetch function
 */
export function useApiDataManual<T>(
  fetchFunction: () => Promise<{ success: boolean; data?: T; message?: string }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction();
      
      if (response.success && response.data !== undefined) {
        setData(response.data);
        return response.data;
      } else {
        const errorMsg = response.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('API Error:', err);
      const errorMsg = err.message || 'Lỗi kết nối mạng. Vui lòng thử lại.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetch, reset };
}
