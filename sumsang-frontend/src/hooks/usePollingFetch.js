import { useState, useEffect, useRef } from 'react';

export function usePollingFetch(fetcher, intervalMs = 10000, useDummy = undefined) {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentInterval, setCurrentInterval] = useState(intervalMs);

	const isMounted = useRef(true);
	const hasFetchedOnce = useRef(false);

	useEffect(() => {
		isMounted.current = true;

		const fetchData = async () => {
			try {
				const result = await fetcher(useDummy);
				if (isMounted.current) {
					setData(result);
					setError(null);
					setLoading(false);
					setCurrentInterval(intervalMs);
					hasFetchedOnce.current = true;
				}
			} catch (err) {
				if (isMounted.current) {
					setError(
						hasFetchedOnce.current
							? 'Refresh failed - data may be out of date'
							: err.message || 'Error'
					);
					setCurrentInterval(1000);
					setLoading(false);
				}
			}
		};

		fetchData();
		const intervalId = setInterval(fetchData, currentInterval);

		return () => {
			isMounted.current = false;
			clearInterval(intervalId);
		};
	}, [fetcher, currentInterval]);

	return { data, error, loading };
}
