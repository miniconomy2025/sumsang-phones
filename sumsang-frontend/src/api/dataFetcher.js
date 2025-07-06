import { apiGet } from './apiHelpers';

export const getProductionData = (useDummy) =>
	apiGet({
		endpoint: '/production',
		dummyFilename: './production.json',
		useDummy,
	});

export const getSupplyChainData = (useDummy) =>
	apiGet({
		endpoint: '/supply-chain',
		dummyFilename: './supplyChain.json',
		useDummy,
	});

export const getSalesData = (useDummy) =>
	apiGet({
		endpoint: '/sales',
		dummyFilename: './sales.json',
		useDummy,
	});

export const getFinancialData = (useDummy) =>
	apiGet({
		endpoint: '/financial',
		dummyFilename: './financial.json',
		useDummy,
	});

export const getLogisticsData = (useDummy) =>
	apiGet({
		endpoint: '/logistics',
		dummyFilename: './logistics.json',
		useDummy,
	});

export const getNoticesData = (useDummy) =>
	apiGet({
		endpoint: '/notices',
		dummyFilename: './notices.json',
		useDummy,
	});
