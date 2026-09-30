import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="content-fade" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 700, color: 'var(--brand)', lineHeight: 1 }}>404</div>
        <h2 style={{ margin: '14px 0 8px', fontSize: 'var(--fs-xl)' }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', maxWidth: 380, margin: '0 auto 20px' }}>
          The view you were looking for doesn't exist in the admin panel.
        </p>
        <Button variant="primary" icon="home" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
