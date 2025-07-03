import { useLocation, useNavigate } from 'react-router-dom'
import styles from './NavigationBar.module.css'

function NavigationBar() {
	const location = useLocation()
	const navigate = useNavigate()

	const links = [
		{ label: 'Production Overview', href: '/production' },
		{ label: 'Supply Chain', href: '/supply' },
		{ label: 'Logistics Flow', href: '/logistics' },
		{ label: 'Sales', href: '/sales' },
		{ label: 'Financial Performance', href: '/financial' },
		{ label: 'Operational Notices', href: '/notices' },
	]

	const handleClick = (href) => {
		navigate(href)
	}

	return (
		<nav>
			<ul className={styles.navList}>
				{links.map((link, index) => (
					<li
						key={index}
						className={location.pathname === link.href ? styles.active : ''}
						onClick={() => handleClick(link.href)}
					>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default NavigationBar
