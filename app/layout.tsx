import type {Metadata} from 'next';
import './styles.css';
export const metadata:Metadata={title:'Automate Your Trades | Deriv Bot',description:'Deriv Bot style automated trading dashboard'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
