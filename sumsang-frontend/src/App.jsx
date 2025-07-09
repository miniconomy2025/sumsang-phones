import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar/NavigationBar';
import ProductionOverview from './components/panels/ProductionOverview/ProductionOverview';
import Sales from './components/panels/Sales/Sales';
import LogisticsFlow from './components/panels/LogisticsFlow/LogisticsFlow';
import SupplyChain from './components/panels/SupplyChain/SupplyChain';
import FinancialPerformance from './components/panels/FinancialPerformance/FinancialPerformance';
import OperationalNotices from './components/panels/OperationalNotices/OperationalNotices';

function App() {
	return (
		<Router>
			<NavigationBar></NavigationBar>
			<Routes>
				<Route path="/" element={<Navigate to="/production" replace />} />
				<Route path="/production" element={<ProductionOverview />} />
				<Route path="/supply" element={<SupplyChain />} />
				<Route path="/logistics" element={<LogisticsFlow />} />
				<Route path="/sales" element={<Sales />} />
				<Route path="/financial" element={<FinancialPerformance />} />
				<Route path="*" element={<h1>Not Found</h1>} />
			</Routes>
		</Router>
	);
}

export default App;
