import './globals.css';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'CoreCS — Interactive Engineering Lab',
  description: 'Visualize the Computer Science fundamentals behind the code.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="dark"><body className="grid-bg"><AppShell>{children}</AppShell></body></html>;
}
