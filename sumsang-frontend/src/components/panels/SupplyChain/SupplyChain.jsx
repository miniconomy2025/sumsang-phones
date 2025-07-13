import { getSupplyChainData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './SupplyChain.module.css';

import PartCostsChart from './charts/PartCostsChart';
import PartsInventoryChart from './charts/PartsInventoryChart';
import GoodsInventoryChart from './charts/GoodsInventoryChart';
import MachineStatusChart from './charts/MachineStatusChart';
import ProductionCapacityChart from './charts/ProductionCapacityChart';

function SupplyChain() {
	const { data, loading, error } = usePollingFetch(getSupplyChainData, 15000);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	return (
		<>
			{error && <div className={styles.errorBanner}>{error}</div>}
			<main className={`grid-container ${styles.gridContainer}`}>
				<section className={`grid-panel ${styles.partCosts}`}>
					<PartCostsChart data={data} />
				</section>
				<section className={`grid-panel ${styles.partsInventory}`}>
					<PartsInventoryChart data={data} />
				</section>
				<section className={`grid-panel ${styles.goodsInventory}`}>
					<GoodsInventoryChart data={data} />
				</section>
				<section className={`grid-panel ${styles.machineStatus}`}>
					<MachineStatusChart data={data} />
				</section>
				<section className={`grid-panel ${styles.productionCapacity}`}>
					<ProductionCapacityChart data={data} />
				</section>
			</main>
		</>
	);
}

export default SupplyChain;
