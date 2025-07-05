import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import styles from './NavigationBar.module.css';

function NavigationBar() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [expandedWidth, setExpandedWidth] = useState(0);
	const navRef = useRef(null);
	const location = useLocation();
	const navigate = useNavigate();

	const links = [
		{ label: 'Production Overview', href: '/production', icon: FactoryIcon },
		{ label: 'Supply Chain', href: '/supply', icon: InventoryIcon },
		{ label: 'Logistics Flow', href: '/logistics', icon: LocalShippingIcon },
		{ label: 'Sales', href: '/sales', icon: PointOfSaleIcon },
		{ label: 'Financial Performance', href: '/financial', icon: AccountBalanceIcon },
		{ label: 'Operational Notices', href: '/notices', icon: NotificationsIcon },
	];

	const handleClick = (href) => {
		navigate(href);
	};

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	useEffect(() => {
		if (navRef.current) {
			const nav = navRef.current;
			const originalWidth = nav.style.width;
			nav.style.width = 'auto';
			nav.style.position = 'absolute';
			nav.style.visibility = 'hidden';

			const measuredWidth = nav.offsetWidth;

			nav.style.width = originalWidth;
			nav.style.position = '';
			nav.style.visibility = '';

			setExpandedWidth(measuredWidth);
		}
	}, []);

	useEffect(() => {
		const currentIndex = links.findIndex((link) => link.href === location.pathname);
		if (currentIndex !== -1) {
			setActiveIndex(currentIndex);
		}
	}, [location.pathname, links]);

	return (
		<nav className={`${styles.nav} ${isExpanded ? styles.expanded : ''}`}>
			<div className={styles.toggleButton} onClick={toggleExpanded}>
				<div className={styles.iconContainer}>
					{isExpanded ? (
						<MenuOpenIcon className={styles.toggleIcon} />
					) : (
						<MenuIcon className={styles.toggleIcon} />
					)}
				</div>
			</div>
			<ul className={styles.navList}>
				<div
					className={styles.activeIndicator}
					style={{ transform: `translateY(${activeIndex * 8}vmin)` }}
				/>
				{links.map((link, index) => {
					const IconComponent = link.icon;
					return (
						<li
							key={index}
							className={`${styles.listItem} ${
								location.pathname === link.href ? styles.active : ''
							}`}
							onClick={() => handleClick(link.href)}
							title={!isExpanded ? link.label : ''}
						>
							<div className={styles.iconContainer}>
								<IconComponent className={styles.icon} />
							</div>
							<div className={styles.textContainer}>
								<span className={styles.label}>{link.label}</span>
							</div>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export default NavigationBar;
